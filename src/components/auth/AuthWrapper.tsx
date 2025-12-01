import React, { useEffect, useState } from 'react'
import { IconLoader2, IconBrain } from '@tabler/icons-react'
import { useAuthStore } from '../../stores/authStore'
import LoginScreen from './LoginScreen'
import TrialExpiredScreen from './TrialExpiredScreen'

interface AuthWrapperProps {
  children: React.ReactNode
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const {
    user,
    subscription,
    isLoading,
    isInitialized,
    initialize,
  } = useAuthStore()

  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Initialize auth on mount
    initialize()

    // Check for deep link tokens from Electron
    if (typeof window !== 'undefined' && (window as any).electron?.onAuthCallback) {
      (window as any).electron.onAuthCallback((tokens: { access_token: string; refresh_token: string }) => {
        useAuthStore.getState().setSessionFromTokens(tokens.access_token, tokens.refresh_token)
      })
    }
  }, [initialize])

  // Hide splash after initialization
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => setShowSplash(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized])

  // Show loading splash
  if (!isInitialized || showSplash) {
    return (
      <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
            <IconBrain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EVIDENRA BASIC</h1>
          <p className="text-white/60 mb-8">Qualitative Datenanalyse mit KI</p>
          <IconLoader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </div>
    )
  }

  // No user logged in - show login screen
  if (!user) {
    return <LoginScreen />
  }

  // User logged in but subscription expired - show upgrade screen
  if (subscription && !subscription.canUse) {
    return <TrialExpiredScreen />
  }

  // User is authenticated and has valid subscription - show app
  return <>{children}</>
}

export default AuthWrapper
