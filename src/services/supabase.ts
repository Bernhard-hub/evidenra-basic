import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'

// Supabase Configuration - Hardcoded for Desktop App
const supabaseUrl = 'https://zvkoulhziksfxnxkkrmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a291bGh6aWtzZnhueGtrcm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTE3NjQsImV4cCI6MjA3OTk4Nzc2NH0.GJ82Zp37DXICVDvhmjSGo6THSmYcSuykRVgN3z4WWW0'

// Create Supabase client for Electron
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled for Electron
    flowType: 'implicit', // Use implicit flow for desktop apps - tokens come directly in URL hash
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Types
export interface UserProfile {
  id: string
  email: string
  trial_start: string
  subscription: 'trial' | 'premium' | 'expired'
  gumroad_sale_id?: string
  upgraded_at?: string
  created_at: string
  last_seen: string
}

// Auth Functions
export const authService = {
  // Send Magic Link - For Electron, opens in default browser
  async sendMagicLink(email: string): Promise<{ error: Error | null }> {
    // For Electron: redirect to webapp for auth callback
    const redirectUrl = 'https://evidenra.com/auth/callback'

    console.log('Magic link redirect URL:', redirectUrl)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    return { error }
  },

  // Sign in with email and password (alternative for desktop)
  async signInWithPassword(email: string, password: string): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { session: data.session, error }
  },

  // Get current session
  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  // Get current user
  async getUser(): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Set session manually (for desktop deep-link auth)
  async setSession(accessToken: string, refreshToken: string): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return { session: data.session, error }
  },
}

// User Profile Functions
export const profileService = {
  // Get or create user profile
  async getOrCreateProfile(user: User): Promise<{ profile: UserProfile | null; error: Error | null }> {
    // First, try to get existing profile
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update last_seen
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id)

      return { profile: existingProfile, error: null }
    }

    // Create new profile with trial
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        trial_start: new Date().toISOString(),
        subscription: 'trial',
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      })
      .select()
      .single()

    return { profile: newProfile, error: createError }
  },

  // Check subscription status
  async checkSubscription(userId: string): Promise<{
    status: 'trial' | 'premium' | 'expired'
    daysRemaining: number
    canUse: boolean
  }> {
    const { data: profile } = await supabase
      .from('users')
      .select('subscription, trial_start')
      .eq('id', userId)
      .single()

    if (!profile) {
      return { status: 'expired', daysRemaining: 0, canUse: false }
    }

    if (profile.subscription === 'premium') {
      return { status: 'premium', daysRemaining: -1, canUse: true }
    }

    // Calculate trial days remaining
    const trialStart = new Date(profile.trial_start)
    const now = new Date()
    const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, 30 - daysPassed)

    if (daysRemaining > 0) {
      return { status: 'trial', daysRemaining, canUse: true }
    }

    return { status: 'expired', daysRemaining: 0, canUse: false }
  },

  // Check subscription by email (for users who haven't logged in yet)
  async checkSubscriptionByEmail(email: string): Promise<{
    status: 'trial' | 'premium' | 'expired' | 'not_found'
    daysRemaining: number
    canUse: boolean
  }> {
    const { data: profile } = await supabase
      .from('users')
      .select('subscription, trial_start')
      .eq('email', email.toLowerCase())
      .single()

    if (!profile) {
      return { status: 'not_found', daysRemaining: 30, canUse: true } // New user gets trial
    }

    if (profile.subscription === 'premium') {
      return { status: 'premium', daysRemaining: -1, canUse: true }
    }

    // Calculate trial days remaining
    const trialStart = new Date(profile.trial_start)
    const now = new Date()
    const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, 30 - daysPassed)

    if (daysRemaining > 0) {
      return { status: 'trial', daysRemaining, canUse: true }
    }

    return { status: 'expired', daysRemaining: 0, canUse: false }
  },
}

export default supabase
