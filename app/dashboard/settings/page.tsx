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
  VolumeX,
  Crown,
  Star,
  Sliders,
  Lock
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
      color: 'emerald'
    },
    {
      key: 'theme' as const,
      label: t('dashboard.settings.theme.title'),
      icon: Palette,
      color: 'teal'
    },
    {
      key: 'notifications' as const,
      label: t('dashboard.settings.notifications.title'),
      icon: Bell,
      color: 'cyan'
    },
    {
      key: 'security' as const,
      label: t('dashboard.settings.security.title'),
      icon: Shield,
      color: 'blue'
    },
    {
      key: 'danger' as const,
      label: t('dashboard.settings.danger.title'),
      icon: AlertTriangle,
      color: 'red'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero moderne */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <Settings className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Sliders className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Star className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Paramètres Avancés
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('dashboard.settings.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('dashboard.settings.description')}
            </p>
          </div>
        </div>

        {/* Navigation par onglets moderne */}
        <div className="flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:scale-105 shadow-lg border border-gray-200/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'language' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-emerald-900">{t('dashboard.settings.language.title')}</span>
                  <p className="text-emerald-700 font-normal mt-2 text-base">
                    {t('dashboard.settings.language.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => handleLanguageChange('fr')}
                  className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg ${
                    language === 'fr'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl shadow-emerald-500/25 scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-emerald-300 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center text-3xl shadow-lg">
                      🇫🇷
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{t('dashboard.settings.language.french')}</h3>
                      <p className="text-gray-600 font-medium">Français</p>
                    </div>
                    {language === 'fr' && (
                      <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => handleLanguageChange('ar')}
                  className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg ${
                    language === 'ar'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-xl shadow-emerald-500/25 scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-emerald-300 hover:bg-white/80 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-3xl flex items-center justify-center text-3xl shadow-lg">
                      🇩🇿
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{t('dashboard.settings.language.arabic')}</h3>
                      <p className="text-gray-600 font-medium">العربية</p>
                    </div>
                    {language === 'ar' && (
                      <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section informative */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-3xl p-8">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-emerald-100 rounded-2xl">
                      <Globe className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Support multilingue</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        DzairBox prend en charge le français et l'arabe avec une interface complètement adaptée, 
                        incluant la direction RTL pour l'arabe et des traductions localisées.
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-600 font-semibold">Changement instantané</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'theme' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-teal-900">{t('dashboard.settings.theme.title')}</span>
                  <p className="text-teal-700 font-normal mt-2 text-base">
                    {t('dashboard.settings.theme.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { key: 'light', icon: Sun, label: t('dashboard.settings.theme.light'), color: 'amber', gradient: 'from-amber-50 to-yellow-50' },
                  { key: 'dark', icon: Moon, label: t('dashboard.settings.theme.dark'), color: 'slate', gradient: 'from-slate-50 to-gray-50' },
                  { key: 'system', icon: Monitor, label: t('dashboard.settings.theme.system'), color: 'blue', gradient: 'from-blue-50 to-indigo-50' }
                ].map(({ key, icon: Icon, label, color, gradient }) => (
                  <div
                    key={key}
                    onClick={() => setTheme(key as any)}
                    className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg ${
                      theme === key
                        ? `border-emerald-500 bg-gradient-to-br ${gradient} shadow-xl shadow-emerald-500/25 scale-105`
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80 hover:scale-105'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg`}>
                        <Icon className={`h-8 w-8 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                        {theme === key && (
                          <div className="mt-3 flex justify-center">
                            <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Aperçu du thème */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 rounded-3xl p-8">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-teal-100 rounded-2xl">
                      <Sparkles className="h-8 w-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {t('dashboard.settings.theme.preview')}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {t('dashboard.settings.theme.previewDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-cyan-900">{t('dashboard.settings.notifications.title')}</span>
                  <p className="text-cyan-700 font-normal mt-2 text-base">
                    {t('dashboard.settings.notifications.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { 
                  key: 'email', 
                  icon: Mail,
                  label: t('dashboard.settings.notifications.email.title'),
                  description: t('dashboard.settings.notifications.email.description'),
                  color: 'blue',
                  gradient: 'from-blue-50 to-indigo-50'
                },
                { 
                  key: 'push', 
                  icon: Smartphone,
                  label: t('dashboard.settings.notifications.push.title'),
                  description: t('dashboard.settings.notifications.push.description'),
                  color: 'purple',
                  gradient: 'from-purple-50 to-pink-50'
                },
                { 
                  key: 'marketing', 
                  icon: Zap,
                  label: t('dashboard.settings.notifications.marketing.title'),
                  description: t('dashboard.settings.notifications.marketing.description'),
                  color: 'orange',
                  gradient: 'from-orange-50 to-amber-50'
                }
              ].map(({ key, icon: Icon, label, description, color, gradient }) => (
                <div key={key} className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-6">
                      <div className={`p-4 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-2xl shadow-lg`}>
                        <Icon className={`h-8 w-8 text-${color}-600`} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">{label}</h3>
                        <p className="text-gray-600 leading-relaxed">{description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                      className={`relative inline-flex h-10 w-18 items-center rounded-full transition-all duration-300 hover:scale-105 ${
                        notifications[key as keyof typeof notifications]
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        notifications[key as keyof typeof notifications] ? 'translate-x-9' : 'translate-x-1'
                      }`}>
                        {notifications[key as keyof typeof notifications] ? (
                          <Volume2 className="h-4 w-4 text-emerald-600 m-2" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-gray-400 m-2" />
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
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-900">{t('dashboard.settings.security.title')}</span>
                  <p className="text-blue-700 font-normal mt-2 text-base">
                    {t('dashboard.settings.security.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Déconnexion */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-emerald-100 rounded-2xl shadow-lg">
                      <LogOut className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">{t('dashboard.settings.security.sessions.title')}</h3>
                      <p className="text-gray-600 leading-relaxed">{t('dashboard.settings.security.sessions.description')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100 font-semibold text-base"
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        {t('dashboard.settings.security.signingOut')}
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5 mr-3" />
                        {t('dashboard.settings.security.sessions.signOut')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Fonctionnalités à venir */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-3xl p-8">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('dashboard.settings.security.comingSoon')}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {t('dashboard.settings.security.comingSoonDescription')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { icon: Lock, label: t('dashboard.settings.security.password.title') },
                        { icon: Shield, label: t('dashboard.settings.security.twoFactor') },
                        { icon: User, label: t('dashboard.settings.security.loginHistory') }
                      ].map(({ icon: FeatureIcon, label }, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <FeatureIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'danger' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-red-900">{t('dashboard.settings.danger.title')}</span>
                  <p className="text-red-700 font-normal mt-2 text-base">
                    {t('dashboard.settings.danger.description')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-3xl p-8">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-red-100 rounded-2xl">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-900 mb-3">
                      {t('dashboard.settings.danger.deleteAccount.title')}
                    </h3>
                    <p className="text-red-700 mb-6 leading-relaxed">
                      {t('dashboard.settings.danger.deleteAccount.description')}
                    </p>
                    
                    {showDeleteConfirm && (
                      <div className="mb-6 p-6 bg-red-100 border border-red-300 rounded-2xl">
                        <div className="flex items-center space-x-3 mb-4">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                          <span className="font-bold text-red-900">Confirmation requise</span>
                        </div>
                        <p className="text-red-800 text-sm mb-4">
                          Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={handleDeleteAccount}
                        variant="outline"
                        className={`border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 rounded-2xl px-8 py-4 font-semibold transition-all duration-300 ${
                          showDeleteConfirm ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' : ''
                        }`}
                      >
                        <Trash2 className="h-5 w-5 mr-3" />
                        {showDeleteConfirm ? 'Confirmer la suppression' : t('dashboard.settings.danger.deleteAccount.button')}
                      </Button>
                      
                      {showDeleteConfirm && (
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-2xl px-8 py-4 font-semibold"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
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