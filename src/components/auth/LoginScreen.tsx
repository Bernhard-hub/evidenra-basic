import React, { useState, useEffect } from 'react'
import { IconMail, IconLoader2, IconCheck, IconBrandWindows, IconBrandApple, IconBrandUbuntu } from '@tabler/icons-react'
import { useAuthStore } from '../../stores/authStore'

const translations = {
  de: {
    title: 'EVIDENRA BASIC',
    subtitle: 'Qualitative Datenanalyse mit KI',
    loginTitle: 'Anmelden',
    loginSubtitle: 'Melde dich an, um deine Projekte zu synchronisieren',
    emailPlaceholder: 'deine@email.de',
    sendLink: 'Magic Link senden',
    sending: 'Wird gesendet...',
    checkEmail: 'Check deine E-Mails!',
    linkSent: 'Wir haben dir einen Login-Link gesendet.',
    openEmail: 'Öffne den Link in der E-Mail, um dich anzumelden.',
    tryAgain: 'Erneut senden',
    features: [
      'GENESIS Engine - KI-gestützte Analyse',
      '30 Tage kostenlos testen',
      'Cloud-Sync auf allen Geräten',
    ],
    genesis: 'Mit GENESIS Engine',
    desktopOnly: 'Nur in der Desktop-Version',
  },
  en: {
    title: 'EVIDENRA BASIC',
    subtitle: 'Qualitative Data Analysis with AI',
    loginTitle: 'Sign In',
    loginSubtitle: 'Sign in to sync your projects',
    emailPlaceholder: 'your@email.com',
    sendLink: 'Send Magic Link',
    sending: 'Sending...',
    checkEmail: 'Check your email!',
    linkSent: 'We sent you a login link.',
    openEmail: 'Open the link in the email to sign in.',
    tryAgain: 'Send again',
    features: [
      'GENESIS Engine - AI-powered analysis',
      '30 days free trial',
      'Cloud sync across devices',
    ],
    genesis: 'With GENESIS Engine',
    desktopOnly: 'Desktop only',
  },
}

type Language = 'de' | 'en'

const LoginScreen: React.FC = () => {
  const [lang, setLang] = useState<Language>('de')
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const { sendMagicLink, isLoading, error, clearError } = useAuthStore()

  const t = translations[lang]

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    setLang(browserLang.startsWith('de') ? 'de' : 'en')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email.trim()) return

    const result = await sendMagicLink(email.trim())
    if (result.success) {
      setEmailSent(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white/60">{t.subtitle}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-yellow-400 text-sm">
            <span className="bg-yellow-500/20 px-2 py-0.5 rounded">{t.genesis}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60">{t.desktopOnly}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/5">
          {!emailSent ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{t.loginTitle}</h2>
                <p className="text-white/60 text-sm">{t.loginSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <IconLoader2 className="w-5 h-5 animate-spin" />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <IconMail className="w-5 h-5" />
                      {t.sendLink}
                    </>
                  )}
                </button>
              </form>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="space-y-3">
                  {t.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/70 text-sm">
                      <IconCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform icons */}
              <div className="mt-6 flex items-center justify-center gap-4 text-white/30">
                <IconBrandWindows className="w-5 h-5" />
                <IconBrandApple className="w-5 h-5" />
                <IconBrandUbuntu className="w-5 h-5" />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <IconCheck className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.checkEmail}</h2>
              <p className="text-white/60 mb-2">{t.linkSent}</p>
              <p className="text-white/40 text-sm mb-6">{t.openEmail}</p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                {t.tryAgain}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
