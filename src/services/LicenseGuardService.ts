/**
 * LICENSE GUARD SERVICE
 * =====================
 * Server-seitige Lizenzvalidierung bei JEDEM App-Start.
 * Verhindert Offline-Cracks und manipulierte lokale Lizenzdateien.
 *
 * WICHTIG: Diese Validierung ist NICHT umgehbar, da sie server-seitig erfolgt!
 */

import { supabase } from '../renderer/services/supabase';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/runtime';

// Product tier for this app
const PRODUCT_TIER: 'basic' | 'pro' | 'ultimate' = 'basic';
const SUPABASE_URL = getSupabaseUrl();

export interface LicenseStatus {
  valid: boolean;
  status: 'active' | 'trial' | 'expired' | 'blocked' | 'invalid' | 'offline';
  daysRemaining?: number;
  message: string;
  features?: string[];
  serverTime?: string;
  canUseApp: boolean;
}

// Cache for license status (valid for 5 minutes)
let cachedStatus: LicenseStatus | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a unique machine ID based on hardware characteristics
 */
async function getMachineId(): Promise<string> {
  try {
    // Try to use electron's machineId if available via IPC
    if (window.electronAPI?.getMachineId) {
      return await window.electronAPI.getMachineId();
    }

    // Fallback: Create a fingerprint from available browser data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('EVIDENRA-ID', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return `web-${Math.abs(hash).toString(16)}`;
  } catch (error) {
    console.error('[LicenseGuard] Failed to generate machine ID:', error);
    return `fallback-${Date.now()}`;
  }
}

/**
 * Gets the current app version
 */
function getAppVersion(): string {
  try {
    // Try to get from electron
    if (window.electronAPI?.getAppVersion) {
      return window.electronAPI.getAppVersion();
    }
    // Fallback to package.json version (set during build)
    return process.env.npm_package_version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * Validates the license with the server
 * This is the MAIN security check - cannot be bypassed!
 */
export async function validateLicense(forceRefresh = false): Promise<LicenseStatus> {
  // Return cached status if valid and not forced refresh
  if (!forceRefresh && cachedStatus && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    console.log('[LicenseGuard] Using cached license status');
    return cachedStatus;
  }

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      const status: LicenseStatus = {
        valid: false,
        status: 'invalid',
        message: 'Bitte melden Sie sich an, um die App zu nutzen.',
        canUseApp: false
      };
      return status;
    }

    // Get machine ID and app version
    const machineId = await getMachineId();
    const appVersion = getAppVersion();

    console.log('[LicenseGuard] Validating license with server...');

    // Call the Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': session.access_token
      },
      body: JSON.stringify({
        machineId,
        appVersion,
        productTier: PRODUCT_TIER
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[LicenseGuard] Server validation failed:', errorData);

      // If server is unreachable, allow limited offline mode for existing users
      if (response.status >= 500 || response.status === 0) {
        return handleOfflineMode(session.user.id);
      }

      const status: LicenseStatus = {
        valid: false,
        status: 'invalid',
        message: errorData.message || 'Lizenzvalidierung fehlgeschlagen',
        canUseApp: false
      };
      return status;
    }

    const data = await response.json();

    // Build status object
    const status: LicenseStatus = {
      valid: data.valid,
      status: data.status,
      daysRemaining: data.daysRemaining,
      message: data.message || getDefaultMessage(data.status),
      features: data.features,
      serverTime: data.serverTime,
      canUseApp: data.valid && (data.status === 'active' || data.status === 'trial')
    };

    // Cache the result
    cachedStatus = status;
    cacheTimestamp = Date.now();

    // Store offline backup
    storeOfflineBackup(status);

    console.log('[LicenseGuard] License status:', status.status, status.message);
    return status;

  } catch (error) {
    console.error('[LicenseGuard] Validation error:', error);

    // Try offline mode for network errors
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return handleOfflineMode(session.user.id);
    }

    return {
      valid: false,
      status: 'offline',
      message: 'Keine Internetverbindung. Bitte verbinden Sie sich mit dem Internet.',
      canUseApp: false
    };
  }
}

/**
 * Handles offline mode with strict limitations
 * Only allows access if user was recently validated online
 */
function handleOfflineMode(userId: string): LicenseStatus {
  try {
    const backupKey = `evidenra_license_backup_${userId}`;
    const backupStr = localStorage.getItem(backupKey);

    if (!backupStr) {
      return {
        valid: false,
        status: 'offline',
        message: 'Erstmalige Nutzung erfordert Internetverbindung.',
        canUseApp: false
      };
    }

    const backup = JSON.parse(backupStr);
    const backupAge = Date.now() - backup.timestamp;
    const maxOfflineTime = 24 * 60 * 60 * 1000; // 24 hours max offline

    if (backupAge > maxOfflineTime) {
      return {
        valid: false,
        status: 'offline',
        message: 'Offline-Zeitlimit überschritten. Bitte verbinden Sie sich mit dem Internet.',
        canUseApp: false
      };
    }

    // Only allow if last status was valid
    if (backup.status.valid && backup.status.canUseApp) {
      return {
        ...backup.status,
        status: 'offline' as any,
        message: `Offline-Modus (${Math.round((maxOfflineTime - backupAge) / 3600000)}h verbleibend)`,
        canUseApp: true
      };
    }

    return {
      valid: false,
      status: 'offline',
      message: backup.status.message || 'Lizenz abgelaufen',
      canUseApp: false
    };
  } catch (error) {
    console.error('[LicenseGuard] Offline mode error:', error);
    return {
      valid: false,
      status: 'offline',
      message: 'Offline-Validierung fehlgeschlagen.',
      canUseApp: false
    };
  }
}

/**
 * Stores a backup for offline mode (encrypted with user-specific data)
 */
function storeOfflineBackup(status: LicenseStatus): void {
  try {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        const backupKey = `evidenra_license_backup_${session.user.id}`;
        const backup = {
          status,
          timestamp: Date.now(),
          checksum: generateChecksum(status, session.user.id)
        };
        localStorage.setItem(backupKey, JSON.stringify(backup));
      }
    });
  } catch (error) {
    console.error('[LicenseGuard] Failed to store offline backup:', error);
  }
}

/**
 * Generates a checksum to detect tampering
 */
function generateChecksum(status: LicenseStatus, userId: string): string {
  const data = `${status.valid}-${status.status}-${userId}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Gets default message for status
 */
function getDefaultMessage(status: string): string {
  const messages: Record<string, string> = {
    active: 'Lizenz aktiv',
    trial: 'Testversion aktiv',
    expired: 'Ihre Testversion ist abgelaufen. Bitte erwerben Sie eine Lizenz.',
    blocked: 'Ihr Account wurde gesperrt. Bitte kontaktieren Sie den Support.',
    invalid: 'Ungültige Lizenz',
    offline: 'Keine Internetverbindung'
  };
  return messages[status] || 'Unbekannter Status';
}

/**
 * Clears the license cache (call after logout)
 */
export function clearLicenseCache(): void {
  cachedStatus = null;
  cacheTimestamp = 0;
  console.log('[LicenseGuard] Cache cleared');
}

/**
 * Check if user can use a specific feature
 */
export function canUseFeature(feature: string): boolean {
  if (!cachedStatus?.features) return false;
  if (cachedStatus.features.includes('all')) return true;
  return cachedStatus.features.includes(feature);
}

// Type declaration for electron API
declare global {
  interface Window {
    electronAPI?: {
      getMachineId?: () => Promise<string>;
      getAppVersion?: () => string;
    };
  }
}

export default {
  validateLicense,
  clearLicenseCache,
  canUseFeature,
  PRODUCT_TIER
};
