/**
 * LICENSE GUARD COMPONENT
 * =======================
 * Wrapper-Komponente die ALLE App-Inhalte schützt.
 * Zeigt Blockier-Screen wenn Lizenz ungültig ist.
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { validateLicense, LicenseStatus, clearLicenseCache } from '../services/LicenseGuardService';
import { supabase } from '../renderer/services/supabase';
import { integrityCheck } from '../services/IntegrityCheckService';

interface LicenseGuardProps {
  children: ReactNode;
  productName?: string;
}

export const LicenseGuard: React.FC<LicenseGuardProps> = ({
  children,
  productName = 'EVIDENRA'
}) => {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add timeout to prevent hanging - 5 seconds max
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        setIsLoggedIn(!!session);

        if (session) {
          // Validate license when logged in
          const status = await validateLicense();
          setLicenseStatus(status);
        }
      } catch (error) {
        console.error('[LicenseGuard] Auth check failed:', error);
        // On error/timeout, let the app load without auth
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuth();
    integrityCheck.startMonitoring();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoggedIn(!!session);

      if (event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        const status = await validateLicense(true); // Force refresh
        setLicenseStatus(status);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        clearLicenseCache();
        setLicenseStatus(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodically re-validate (every 30 minutes)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      const status = await validateLicense(true);
      setLicenseStatus(status);

      // If license became invalid, force a UI update
      if (!status.canUseApp) {
        console.warn('[LicenseGuard] License no longer valid, blocking access');
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="license-guard-loading">
        <div className="license-guard-spinner"></div>
        <p>Überprüfe Lizenz...</p>
        <style>{`
          .license-guard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .license-guard-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #6366f1;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not logged in, show the app (login will be handled by app)
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  // If license check failed or is invalid, show block screen
  if (licenseStatus && !licenseStatus.canUseApp) {
    return (
      <div className="license-guard-blocked">
        <div className="license-guard-blocked-content">
          <div className="license-guard-icon">
            {licenseStatus.status === 'expired' ? '⏰' :
             licenseStatus.status === 'blocked' ? '🚫' : '🔒'}
          </div>
          <h1>{productName}</h1>
          <h2>
            {licenseStatus.status === 'expired' && 'Testversion abgelaufen'}
            {licenseStatus.status === 'blocked' && 'Account gesperrt'}
            {licenseStatus.status === 'invalid' && 'Ungültige Lizenz'}
            {licenseStatus.status === 'offline' && 'Keine Verbindung'}
          </h2>
          <p className="license-guard-message">{licenseStatus.message}</p>

          {licenseStatus.status === 'expired' && (
            <div className="license-guard-upgrade">
              <p>Erwerben Sie jetzt eine Lizenz, um alle Funktionen freizuschalten:</p>
              <a
                href="https://evidenra.gumroad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="license-guard-button"
              >
                Jetzt kaufen
              </a>
            </div>
          )}

          {licenseStatus.status === 'offline' && (
            <button
              className="license-guard-button secondary"
              onClick={async () => {
                setIsLoading(true);
                const status = await validateLicense(true);
                setLicenseStatus(status);
                setIsLoading(false);
              }}
            >
              Erneut versuchen
            </button>
          )}

          {licenseStatus.status === 'blocked' && (
            <p className="license-guard-contact">
              Kontakt: <a href="mailto:support@evidenra.com">support@evidenra.com</a>
            </p>
          )}

          <button
            className="license-guard-logout"
            onClick={async () => {
              await supabase.auth.signOut();
              clearLicenseCache();
            }}
          >
            Abmelden
          </button>
        </div>

        <style>{`
          .license-guard-blocked {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 20px;
          }
          .license-guard-blocked-content {
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
          }
          .license-guard-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .license-guard-blocked-content h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .license-guard-blocked-content h2 {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 16px 0;
            color: #f87171;
          }
          .license-guard-message {
            color: rgba(255,255,255,0.7);
            margin-bottom: 24px;
            line-height: 1.5;
          }
          .license-guard-upgrade {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .license-guard-upgrade p {
            margin: 0 0 16px 0;
            font-size: 14px;
          }
          .license-guard-button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .license-guard-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          }
          .license-guard-button.secondary {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .license-guard-contact {
            font-size: 13px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 20px;
          }
          .license-guard-contact a {
            color: #6366f1;
          }
          .license-guard-logout {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.6);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
          }
          .license-guard-logout:hover {
            background: rgba(255,255,255,0.05);
            color: white;
          }
        `}</style>
      </div>
    );
  }

  // License is valid, show the app with trial info if applicable
  return (
    <>
      {licenseStatus?.status === 'trial' && licenseStatus.daysRemaining !== undefined && (
        <div className="license-guard-trial-banner">
          ⏰ Testversion: {licenseStatus.daysRemaining} Tage verbleibend
          <a href="https://evidenra.gumroad.com" target="_blank" rel="noopener noreferrer">
            Jetzt upgraden
          </a>
          <style>{`
            .license-guard-trial-banner {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(90deg, #f59e0b, #d97706);
              color: white;
              text-align: center;
              padding: 8px;
              font-size: 13px;
              font-weight: 500;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
            }
            .license-guard-trial-banner a {
              color: white;
              background: rgba(0,0,0,0.2);
              padding: 4px 12px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 600;
            }
            .license-guard-trial-banner a:hover {
              background: rgba(0,0,0,0.3);
            }
          `}</style>
        </div>
      )}
      {children}
    </>
  );
};

export default LicenseGuard;
