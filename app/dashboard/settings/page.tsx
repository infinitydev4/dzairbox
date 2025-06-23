"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Trash2, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor,
  CheckCircle,
  AlertTriangle,
  Palette,
  User,
  Loader2,
  Sparkles,
  Zap,
  Mail,
  Smartphone,
  Volume2,
  VolumeX
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'language' | 'theme' | 'notifications' | 'security' | 'danger'>('language')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLanguageChange = (newLanguage: 'fr' | 'ar') => {
    setLanguage(newLanguage)
  }

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      // Implement account deletion logic
      console.log("Deleting account...")
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const tabs = [
    {
      key: 'language' as const,
      label: t('dashboard.settings.language.title'),
      icon: Globe,
      color: 'blue'
    },
    {
      key: 'theme' as const,
      label: t('dashboard.settings.theme.title'),
      icon: Palette,
      color: 'purple'
    },
    {
      key: 'notifications' as const,
      label: t('dashboard.settings.notifications.title'),
      icon: Bell,
      color: 'emerald'
    },
    {
      key: 'security' as const,
      label: t('dashboard.settings.security.title'),
      icon: Shield,
      color: 'orange'
    },
    {
      key: 'danger' as const,
      label: t('dashboard.settings.danger.title'),
      icon: AlertTriangle,
      color: 'red'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header moderne */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/25">
              <Settings className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('dashboard.settings.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('dashboard.settings.description')}
            </p>
          </div>
        </div>

        {/* Navigation par onglets moderne */}
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-xl shadow-${tab.color}-500/25 scale-105`
                    : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 hover:text-gray-900 hover:scale-105 shadow-lg shadow-black/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'language' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-blue-900">{t('dashboard.settings.language.title')}</span>
                  <p className="text-sm text-blue-700 font-normal mt-1">
                    {t('dashboard.settings.language.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => handleLanguageChange('fr')}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                    language === 'fr'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/25 scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl">
                      🇫🇷
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{t('dashboard.settings.language.french')}</h3>
                      <p className="text-sm text-gray-600">Français</p>
                    </div>
                    {language === 'fr' && (
                      <div className="p-2 bg-blue-500 rounded-full">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => handleLanguageChange('ar')}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                    language === 'ar'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/25 scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center text-2xl">
                      🇩🇿
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{t('dashboard.settings.language.arabic')}</h3>
                      <p className="text-sm text-gray-600">العربية</p>
                    </div>
                    {language === 'ar' && (
                      <div className="p-2 bg-emerald-500 rounded-full">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'theme' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-purple-900">{t('dashboard.settings.theme.title')}</span>
                  <p className="text-sm text-purple-700 font-normal mt-1">
                    {t('dashboard.settings.theme.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'light', icon: Sun, label: t('dashboard.settings.theme.light'), color: 'amber' },
                  { key: 'dark', icon: Moon, label: t('dashboard.settings.theme.dark'), color: 'slate' },
                  { key: 'system', icon: Monitor, label: t('dashboard.settings.theme.system'), color: 'blue' }
                ].map(({ key, icon: Icon, label, color }) => (
                  <div
                    key={key}
                    onClick={() => setTheme(key as any)}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                      theme === key
                        ? `border-${color}-500 bg-gradient-to-br from-${color}-50 to-${color}-100 shadow-lg shadow-${color}-500/25 scale-105`
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80 hover:scale-105'
                    }`}
                  >
                    <div className="text-center space-y-3">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-2xl flex items-center justify-center mx-auto`}>
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{label}</h3>
                        {theme === key && (
                          <div className="mt-2 flex justify-center">
                            <div className={`p-1 bg-${color}-500 rounded-full`}>
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Aperçu du thème */}
              <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-900">
                      {t('dashboard.settings.theme.preview')}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {t('dashboard.settings.theme.previewDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-emerald-900">{t('dashboard.settings.notifications.title')}</span>
                  <p className="text-sm text-emerald-700 font-normal mt-1">
                    {t('dashboard.settings.notifications.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                { 
                  key: 'email', 
                  icon: Mail,
                  label: t('dashboard.settings.notifications.email.title'),
                  description: t('dashboard.settings.notifications.email.description'),
                  color: 'blue'
                },
                { 
                  key: 'push', 
                  icon: Smartphone,
                  label: t('dashboard.settings.notifications.push.title'),
                  description: t('dashboard.settings.notifications.push.description'),
                  color: 'purple'
                },
                { 
                  key: 'marketing', 
                  icon: Zap,
                  label: t('dashboard.settings.notifications.marketing.title'),
                  description: t('dashboard.settings.notifications.marketing.description'),
                  color: 'orange'
                }
              ].map(({ key, icon: Icon, label, description, color }) => (
                <div key={key} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl`}>
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                        notifications[key as keyof typeof notifications]
                          ? `bg-gradient-to-r from-${color}-500 to-${color}-600 shadow-lg shadow-${color}-500/25`
                          : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        notifications[key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                      }`}>
                        {notifications[key as keyof typeof notifications] ? (
                          <Volume2 className="h-3 w-3 text-emerald-600 m-1.5" />
                        ) : (
                          <VolumeX className="h-3 w-3 text-gray-400 m-1.5" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-orange-900">{t('dashboard.settings.security.title')}</span>
                  <p className="text-sm text-orange-700 font-normal mt-1">
                    {t('dashboard.settings.security.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Déconnexion */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <LogOut className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-blue-900">{t('dashboard.settings.security.sessions.title')}</h3>
                      <p className="text-sm text-blue-700">{t('dashboard.settings.security.sessions.description')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('dashboard.settings.security.signingOut')}
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('dashboard.settings.security.sessions.signOut')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Fonctionnalités à venir */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-900">
                      {t('dashboard.settings.security.comingSoon')}
                    </h4>
                    <p className="text-sm text-orange-700">
                      {t('dashboard.settings.security.comingSoonDescription')}
                    </p>
                    <ul className="text-sm text-orange-700 space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.settings.security.password.title')}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.settings.security.twoFactor')}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.settings.security.loginHistory')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'danger' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-red-900">{t('dashboard.settings.danger.title')}</span>
                  <p className="text-sm text-red-700 font-normal mt-1">
                    {t('dashboard.settings.danger.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200/50">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-red-900">{t('dashboard.settings.danger.deleteAccount.title')}</h3>
                      <p className="text-sm text-red-700">{t('dashboard.settings.danger.deleteAccount.description')}</p>
                    </div>
                  </div>

                  {showDeleteConfirm && (
                    <div className="bg-red-100 border border-red-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-900">{t('dashboard.settings.danger.deleteAccount.warning')}</span>
                      </div>
                      <p className="text-sm text-red-800">{t('dashboard.settings.danger.deleteAccount.warningText')}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    {showDeleteConfirm ? (
                      <>
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          className="px-6 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {t('dashboard.settings.danger.deleteAccount.cancel')}
                        </Button>
                        <Button
                          onClick={handleDeleteAccount}
                          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-red-600/25 transition-all duration-300 hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('dashboard.settings.danger.deleteAccount.confirm')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-red-600/25 transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('dashboard.settings.danger.deleteAccount.button')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 