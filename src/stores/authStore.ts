import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { authService, profileService, UserProfile } from '../services/supabase'

interface SubscriptionStatus {
  status: 'trial' | 'premium' | 'expired'
  daysRemaining: number
  canUse: boolean
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  subscription: SubscriptionStatus | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  sendMagicLink: (email: string) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<void>
  refreshSubscription: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  clearError: () => void
  setSessionFromTokens: (accessToken: string, refreshToken: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      subscription: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      initialize: async () => {
        set({ isLoading: true })

        try {
          // Get current session
          const { session, error: sessionError } = await authService.getSession()

          if (sessionError) {
            set({ isLoading: false, isInitialized: true, error: sessionError.message })
            return
          }

          if (!session?.user) {
            set({ isLoading: false, isInitialized: true, user: null, session: null })
            return
          }

          // Get or create profile
          const { profile, error: profileError } = await profileService.getOrCreateProfile(
            session.user
          )

          if (profileError) {
            set({ isLoading: false, isInitialized: true, error: profileError.message })
            return
          }

          // Check subscription
          const subscription = await profileService.checkSubscription(session.user.id)

          set({
            user: session.user,
            session,
            profile,
            subscription,
            isLoading: false,
            isInitialized: true,
            error: null,
          })

          // Listen for auth changes
          authService.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession?.user) {
              const { profile } = await profileService.getOrCreateProfile(newSession.user)
              const subscription = await profileService.checkSubscription(newSession.user.id)
              set({ user: newSession.user, session: newSession, profile, subscription })
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, profile: null, subscription: null })
            }
          })
        } catch (error) {
          set({
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          })
        }
      },

      sendMagicLink: async (email: string) => {
        set({ isLoading: true, error: null })

        try {
          console.log('Sending magic link to:', email)
          const { error } = await authService.sendMagicLink(email)

          if (error) {
            console.error('Magic link error:', error)
            const errorMsg = error.message || 'Unbekannter Fehler beim Email-Versand'
            set({ isLoading: false, error: errorMsg })
            return { success: false, error: errorMsg }
          }

          console.log('Magic link sent successfully')
          set({ isLoading: false })
          return { success: true, error: null }
        } catch (error) {
          console.error('Magic link exception:', error)
          const message = error instanceof Error ? error.message : 'Fehler beim Senden des Links'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      signOut: async () => {
        set({ isLoading: true })

        try {
          await authService.signOut()
          set({
            user: null,
            session: null,
            profile: null,
            subscription: null,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Fehler beim Abmelden',
          })
        }
      },

      refreshSubscription: async () => {
        const { user } = get()
        if (!user) return

        const subscription = await profileService.checkSubscription(user.id)
        set({ subscription })
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      clearError: () => set({ error: null }),

      // For Electron deep-link auth
      setSessionFromTokens: async (accessToken: string, refreshToken: string) => {
        try {
          const { session, error } = await authService.setSession(accessToken, refreshToken)

          if (error || !session?.user) {
            set({ error: error?.message || 'Session konnte nicht gesetzt werden' })
            return false
          }

          const { profile } = await profileService.getOrCreateProfile(session.user)
          const subscription = await profileService.checkSubscription(session.user.id)

          set({
            user: session.user,
            session,
            profile,
            subscription,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Auth Fehler' })
          return false
        }
      },
    }),
    {
      name: 'evidenra-desktop-auth',
      partialize: (state) => ({
        // Only persist essential data
        user: state.user,
        profile: state.profile,
      }),
    }
  )
)

export default useAuthStore
