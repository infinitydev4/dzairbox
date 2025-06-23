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
  Sparkles
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
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
      color: 'blue'
    },
    {
      key: 'account' as const,
      label: t('dashboard.profile.accountInfo'),
      icon: UserCheck,
      color: 'emerald'
    },
    {
      key: 'security' as const,
      label: t('dashboard.profile.security.title'),
      icon: Shield,
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header moderne */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/25">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {profile?.name || t('dashboard.profile.noName')}
            </h1>
            <p className="text-gray-600 flex items-center justify-center space-x-2 mt-2">
              <Mail className="h-4 w-4" />
              <span>{profile?.email}</span>
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
        {activeTab === 'personal' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-blue-900">{t('dashboard.profile.personalInfo')}</span>
                  <p className="text-sm text-blue-700 font-normal mt-1">
                    {t('dashboard.profile.personalInfoDesc')}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nom */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>{t('dashboard.profile.name')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t('dashboard.profile.namePlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>{t('dashboard.profile.email')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t('dashboard.profile.emailPlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>{t('dashboard.profile.phone')}</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t('dashboard.profile.phonePlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                    />
                  </div>

                  {/* Ville */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{t('dashboard.profile.city')}</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder={t('dashboard.profile.cityPlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                    />
                  </div>
                </div>

                {/* Adresse complète */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{t('dashboard.profile.address')}</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder={t('dashboard.profile.addressPlaceholder')}
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                  />
                </div>

                {/* Bouton de sauvegarde */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {unsavedChanges ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span>{t('dashboard.profile.unsavedChanges')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{t('dashboard.profile.allSaved')}</span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSaving || !unsavedChanges}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('dashboard.profile.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
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
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-emerald-900">{t('dashboard.profile.accountInfo')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('dashboard.profile.memberId')}</h3>
                      <p className="text-sm text-gray-600 font-mono">{profile?.id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('dashboard.profile.memberSince')}</h3>
                      <p className="text-sm text-gray-600">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('dashboard.profile.accountStatus')}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">{t('dashboard.profile.active')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-purple-900">{t('dashboard.profile.security.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-900">
                      {t('dashboard.profile.security.comingSoon')}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {t('dashboard.profile.security.description')}
                    </p>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.profile.security.features.password')}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.profile.security.features.sessions')}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t('dashboard.profile.security.features.twoFactor')}</span>
                      </li>
                    </ul>
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