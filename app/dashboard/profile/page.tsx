"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Shield,
  Edit3,
  UserCheck,
  Clock,
  Sparkles,
  Crown,
  Star,
  Award
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { t } = useLanguage()
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'security'>('personal')
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: ""
  })

  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  useEffect(() => {
    if (profile) {
      const hasChanges = 
        formData.name !== (profile.name || "") ||
        formData.email !== (profile.email || "") ||
        formData.phone !== (profile.phone || "") ||
        formData.address !== (profile.address || "") ||
        formData.city !== (profile.city || "")
      setUnsavedChanges(hasChanges)
    }
  }, [formData, profile])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || ""
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ type: 'error', text: t('common.error') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage({ type: 'success', text: t('dashboard.profile.updateSuccess') })
        
        // Update session if name changed
        if (formData.name !== session?.user?.name) {
          await update({ name: formData.name })
        }
      } else {
        setMessage({ type: 'error', text: t('dashboard.profile.updateError') })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: 'error', text: t('common.error') })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-pulse">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-emerald-500">
              <Loader2 className="h-3 w-3 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{t('dashboard.profile.loading')}</h3>
            <p className="text-gray-600 mt-2">{t('dashboard.profile.loadingSubtitle')}</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      key: 'personal' as const,
      label: t('dashboard.profile.personalInfo'),
      icon: User,
      color: 'emerald'
    },
    {
      key: 'account' as const,
      label: t('dashboard.profile.accountInfo'),
      icon: UserCheck,
      color: 'teal'
    },
    {
      key: 'security' as const,
      label: t('dashboard.profile.security.title'),
      icon: Shield,
      color: 'cyan'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero moderne */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <User className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Profil Vérifié
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {profile?.name || t('dashboard.profile.noName')}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}</span>
              </div>
            </div>
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
        {activeTab === 'personal' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-emerald-900">{t('dashboard.profile.personalInfo')}</span>
                  <p className="text-emerald-700 font-normal mt-2 text-base">
                    {t('dashboard.profile.personalInfoDesc')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Message de statut */}
                {message && (
                  <div className={`p-6 rounded-2xl border-2 flex items-center space-x-4 ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <AlertCircle className="h-6 w-6" />
                    )}
                    <span className="font-semibold text-base">{message.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Nom */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      <span>{t('dashboard.profile.name')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t('dashboard.profile.namePlaceholder')}
                      className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-14 text-base px-4"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      <span>{t('dashboard.profile.email')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t('dashboard.profile.emailPlaceholder')}
                      className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-14 text-base px-4"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <span>{t('dashboard.profile.phone')}</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t('dashboard.profile.phonePlaceholder')}
                      className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-14 text-base px-4"
                    />
                  </div>

                  {/* Ville */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <span>{t('dashboard.profile.city')}</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder={t('dashboard.profile.cityPlaceholder')}
                      className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-14 text-base px-4"
                    />
                  </div>
                </div>

                {/* Adresse complète */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <span>{t('dashboard.profile.address')}</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder={t('dashboard.profile.addressPlaceholder')}
                    className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-14 text-base px-4"
                  />
                </div>

                {/* Bouton de sauvegarde */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {unsavedChanges ? (
                      <>
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{t('dashboard.profile.unsavedChanges')}</p>
                          <p className="text-sm text-gray-600">Modifications en attente</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{t('dashboard.profile.allSaved')}</p>
                          <p className="text-sm text-gray-600">Tout est synchronisé</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSaving || !unsavedChanges}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100 font-semibold text-base"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        {t('dashboard.profile.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-3" />
                        {t('dashboard.profile.save')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'account' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-teal-900">{t('dashboard.profile.accountInfo')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{t('dashboard.profile.memberId')}</h3>
                      <p className="text-sm text-gray-600 font-mono bg-white/80 px-3 py-1 rounded-lg mt-1">
                        {profile?.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-teal-100 rounded-2xl">
                      <Calendar className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{t('dashboard.profile.memberSince')}</h3>
                      <p className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-lg mt-1">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{t('dashboard.profile.accountStatus')}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                        <span className="text-sm text-emerald-600 font-semibold bg-emerald-100 px-3 py-1 rounded-lg">{t('dashboard.profile.active')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section statistiques */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span>Statistiques du compte</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                    <div className="text-sm text-gray-600">Entreprises créées</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">1</div>
                    <div className="text-sm text-gray-600">Profil complété</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {Math.floor((Date.now() - new Date(profile?.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600">Jours d'ancienneté</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50 p-8">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-cyan-900">{t('dashboard.profile.security.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-3xl p-8">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-emerald-100 rounded-2xl">
                      <Sparkles className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité renforcée</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Votre compte est protégé par nos systèmes de sécurité avancés. Nous recommandons d'utiliser un mot de passe fort et de garder vos informations à jour.
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-600 font-semibold">Compte sécurisé</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email vérifié</h4>
                        <p className="text-sm text-gray-600">Votre adresse email est confirmée</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">Vérifié</span>
                    </div>
                  </div>

                  <div className="bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Settings className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Paramètres de sécurité</h4>
                        <p className="text-sm text-gray-600">Gérez vos préférences de sécurité</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-300 hover:border-emerald-500 hover:text-emerald-600">
                      Configurer
                    </Button>
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