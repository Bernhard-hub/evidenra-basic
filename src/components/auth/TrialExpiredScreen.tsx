import React, { useState, useEffect } from 'react'
import {
  IconLock,
  IconRocket,
  IconCheck,
  IconBrain,
  IconCrown,
  IconRefresh,
  IconExternalLink,
} from '@tabler/icons-react'
import { useAuthStore } from '../../stores/authStore'

const translations = {
  de: {
    title: 'Testphase beendet',
    subtitle: 'Deine 30-Tage-Testphase ist abgelaufen',
    projectsSafe: 'Keine Sorge - deine Projekte sind sicher gespeichert!',
    upgradeTitle: 'EVIDENRA BASIC freischalten',
    yearlyPrice: '199',
    yearlyPeriod: '/Jahr',
    monthlyPrice: '19',
    monthlyPeriod: '/Monat',
    yearlyLabel: 'Jahresabo',
    monthlyLabel: 'Monatsabo',
    yearlySaving: 'Spare 13%',
    features: [
      'Unbegrenzte Projekte',
      'GENESIS Engine',
      'Cloud-Sync',
      'Priority Support',
    ],
    upgradeButton: 'Jetzt freischalten',
    securePayment: 'Sichere Zahlung via Gumroad',
    moneyBack: '30 Tage Geld-zurück-Garantie',
    checkSubscription: 'Bereits gekauft?',
    refreshButton: 'Status aktualisieren',
  },
  en: {
    title: 'Trial Ended',
    subtitle: 'Your 30-day trial has expired',
    projectsSafe: "Don't worry - your projects are safely stored!",
    upgradeTitle: 'Unlock EVIDENRA BASIC',
    yearlyPrice: '199',
    yearlyPeriod: '/year',
    monthlyPrice: '19',
    monthlyPeriod: '/month',
    yearlyLabel: 'Yearly',
    monthlyLabel: 'Monthly',
    yearlySaving: 'Save 13%',
    features: [
      'Unlimited projects',
      'GENESIS Engine',
      'Cloud sync',
      'Priority support',
    ],
    upgradeButton: 'Unlock Now',
    securePayment: 'Secure payment via Gumroad',
    moneyBack: '30-day money-back guarantee',
    checkSubscription: 'Already purchased?',
    refreshButton: 'Refresh status',
  },
}

type Language = 'de' | 'en'
type PricingPlan = 'yearly' | 'monthly'

const GUMROAD_URL = 'https://evidenra.gumroad.com/l/fxpwhk'

const TrialExpiredScreen: React.FC = () => {
  const [lang, setLang] = useState<Language>('de')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('yearly')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user, refreshSubscription } = useAuthStore()

  const t = translations[lang]

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    setLang(browserLang.startsWith('de') ? 'de' : 'en')
  }, [])

  const handleUpgrade = () => {
    const url = new URL(GUMROAD_URL)
    if (user?.email) {
      url.searchParams.set('email', user.email)
    }
    // Open in default browser (Electron)
    if (typeof window !== 'undefined' && (window as any).electron?.shell) {
      (window as any).electron.shell.openExternal(url.toString())
    } else {
      window.open(url.toString(), '_blank')
    }
  }

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true)
    await refreshSubscription()
    setIsRefreshing(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Card */}
      <div className="relative max-w-lg w-full">
        {/* Lock Icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <IconLock className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="glass-card p-8 pt-16 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/5">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-white/60 text-lg">{t.subtitle}</p>
            <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-2">
              <IconCheck className="w-4 h-4" />
              {t.projectsSafe}
            </p>
          </div>

          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl p-6 border border-primary-500/30 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <IconCrown className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{t.upgradeTitle}</h2>
            </div>

            {/* Pricing Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedPlan === 'yearly'
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="text-2xl font-bold">
                  €{t.yearlyPrice}
                  <span className="text-sm font-normal opacity-70">{t.yearlyPeriod}</span>
                </div>
                <div className="text-xs opacity-70">{t.yearlyLabel}</div>
                {selectedPlan === 'yearly' && (
                  <div className="text-xs mt-1 bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 inline-block">
                    {t.yearlySaving}
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="text-2xl font-bold">
                  €{t.monthlyPrice}
                  <span className="text-sm font-normal opacity-70">{t.monthlyPeriod}</span>
                </div>
                <div className="text-xs opacity-70">{t.monthlyLabel}</div>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {t.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                  <IconCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Button */}
            <button
              onClick={handleUpgrade}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/30"
            >
              <IconRocket className="w-6 h-6" />
              {t.upgradeButton}
              <IconExternalLink className="w-5 h-5 opacity-70" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-4 text-white/50 text-xs">
              <span>{t.securePayment}</span>
              <span>•</span>
              <span>{t.moneyBack}</span>
            </div>
          </div>

          {/* Already Purchased */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">{t.checkSubscription}</p>
            <button
              onClick={handleRefreshSubscription}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 text-sm transition-colors disabled:opacity-50"
            >
              <IconRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t.refreshButton}
            </button>
          </div>

          {/* GENESIS Badge */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <span className="text-white/40 text-xs flex items-center justify-center gap-1">
              <IconBrain className="w-3 h-3" />
              GENESIS Engine - Nur in der Desktop-Version
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrialExpiredScreen
