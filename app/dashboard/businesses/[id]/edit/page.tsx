"use client"

// Page d'édition d'entreprise
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { S3Image } from "@/components/ui/s3-image"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { businessCategories, daysOfWeek } from "@/lib/constants"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Loader2, 
  ArrowLeft,
  Save,
  Trash2,
  Camera,
  X,
  Star,
  Settings,
  Eye,
  Edit3,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Shield
} from "lucide-react"


export default function EditBusinessPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingImages, setIsSavingImages] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    services: "",
    heroImage: "",
    images: [] as string[],
    hours: {} as Record<string, { open: string; close: string; closed: boolean }>,
    subdomain: ""
  })

  // Fonction pour recharger les données depuis l'API
  const refreshBusinessData = async () => {
    setIsLoading(true)
    await fetchBusiness()
    setIsLoading(false)
  }

  // Fonction pour sauvegarder uniquement les images
  const saveImagesOnly = async (newImages: string[], newHeroImage?: string) => {
    try {
      setIsSavingImages(true)
      
      // Envoyer seulement les données d'images (l'API gère maintenant les mises à jour partielles)
      const imageData = {
        images: newImages,
        heroImage: newHeroImage || formData.heroImage
      }
      
      const response = await fetch(`/api/businesses/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(imageData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('dashboard.editBusiness.messages.saveError'))
      }
      
      setFormData(prev => ({
        ...prev,
        images: newImages,
        heroImage: newHeroImage || prev.heroImage
      }))
      
      toast({
        title: t('dashboard.editBusiness.messages.imagesSaved'),
        description: t('dashboard.editBusiness.messages.imagesUpdated')
      })
    } catch (error) {
      console.error("Erreur sauvegarde images:", error)
      toast({
        title: t('dashboard.editBusiness.messages.saveError'),
        description: error instanceof Error ? error.message : t('dashboard.editBusiness.messages.cannotSaveImages'),
        variant: "destructive"
      })
    } finally {
      setIsSavingImages(false)
    }
  }

  // Charger les données de l'entreprise
  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${params.id}`)
      if (!response.ok) throw new Error("Business not found")
      
      const business = await response.json()
      
      let parsedImages: string[] = []
      if (business.images) {
        if (typeof business.images === 'string') {
          try {
            parsedImages = JSON.parse(business.images)
          } catch {
            parsedImages = [business.images]
          }
        } else if (Array.isArray(business.images)) {
          parsedImages = business.images
        }
      }

      let parsedHours: Record<string, { open: string; close: string; closed: boolean }> = {}
      if (business.hours) {
        if (typeof business.hours === 'string') {
          try {
            const hoursData = JSON.parse(business.hours)
            // Convertir l'ancien format en nouveau format si nécessaire
            Object.keys(hoursData).forEach(key => {
              if (typeof hoursData[key] === 'string') {
                // Ancien format: "08:00-18:00" ou "Fermé"
                if (hoursData[key] === 'Fermé') {
                  parsedHours[key] = { open: '', close: '', closed: true }
                } else {
                  const [open, close] = hoursData[key].split('-')
                  parsedHours[key] = { open: open || '', close: close || '', closed: false }
                }
              } else if (hoursData[key] && typeof hoursData[key] === 'object') {
                // Nouveau format déjà
                parsedHours[key] = hoursData[key]
              }
            })
          } catch {
            parsedHours = {}
          }
        } else if (typeof business.hours === 'object') {
          parsedHours = business.hours
        }
      }
      
      // Initialiser tous les jours de la semaine avec des valeurs par défaut si non présents
      daysOfWeek.forEach(day => {
        if (!parsedHours[day.key]) {
          parsedHours[day.key] = { open: '', close: '', closed: false }
        }
      })

      setFormData({
        name: business.name || "",
        category: business.category || "",
        description: business.description || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        facebook: business.facebook || "",
        instagram: business.instagram || "",
        tiktok: business.tiktok || "",
        youtube: business.youtube || "",
        services: business.services || "",
        heroImage: business.heroImage || "",
        images: parsedImages.filter(img => img && typeof img === 'string'),
        hours: parsedHours,
        subdomain: business.subdomain || ""
      })
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast({
        title: t('dashboard.editBusiness.messages.saveError'),
        description: t('dashboard.editBusiness.messages.loadError'),
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchBusiness()
      setIsLoading(false)
    }
    loadData()
  }, [params.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setUnsavedChanges(true)
  }

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }))
    setUnsavedChanges(true)
  }

  const applyToAllWeek = () => {
    const dimancheHours = formData.hours['dimanche']
    if (!dimancheHours) {
      toast({
        title: t('dashboard.editBusiness.hours.noSundayHours'),
        description: t('dashboard.editBusiness.hours.setSundayFirst'),
        variant: "destructive"
      })
      return
    }

    const newHours: Record<string, { open: string; close: string; closed: boolean }> = {}
    daysOfWeek.forEach(day => {
      newHours[day.key] = { ...dimancheHours }
    })

    setFormData(prev => ({
      ...prev,
      hours: newHours
    }))
    setUnsavedChanges(true)
    
    toast({
      title: t('dashboard.editBusiness.hours.applied'),
      description: t('dashboard.editBusiness.hours.appliedToAll')
    })
  }

  // Fonction modifiée pour ajouter une image avec sauvegarde automatique
  const handleAddImage = async (url: string) => {
    const newImages = [...formData.images, url]
    await saveImagesOnly(newImages)
  }

  // Fonction modifiée pour définir l'image hero avec sauvegarde automatique
  const handleSetHeroImage = async (imageUrl: string) => {
    await saveImagesOnly(formData.images, imageUrl)
  }

  // Fonction modifiée pour supprimer une image avec sauvegarde automatique
  const handleRemoveImage = async (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    await saveImagesOnly(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/businesses/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('dashboard.editBusiness.messages.updateError'))
      }

      setUnsavedChanges(false)
      toast({
        title: t('dashboard.editBusiness.messages.updateSuccess'),
        description: t('dashboard.editBusiness.messages.updateSuccess')
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      toast({
        title: t('dashboard.editBusiness.messages.saveError'),
        description: error instanceof Error ? error.message : t('dashboard.editBusiness.messages.unexpectedError'),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('dashboard.editBusiness.deleteConfirm'))) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/businesses/${params.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error(t('dashboard.editBusiness.messages.deleteError'))
      }

      toast({
        title: t('dashboard.editBusiness.messages.deleteSuccess'),
        description: t('dashboard.editBusiness.messages.deleteSuccess')
      })
      
      router.push("/dashboard/businesses")
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: t('dashboard.editBusiness.messages.saveError'),
        description: error instanceof Error ? error.message : t('dashboard.editBusiness.messages.unexpectedError'),
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/10 p-8 max-w-md w-full border border-white/20">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.editBusiness.loadingBusiness')}</h3>
              <p className="text-sm text-gray-600">{t('dashboard.editBusiness.loadingInterface')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: t('dashboard.editBusiness.tabs.general'), icon: Building2, color: 'emerald' },
    { id: 'images', label: t('dashboard.editBusiness.tabs.images'), icon: Camera, color: 'blue' },
    { id: 'contact', label: t('dashboard.editBusiness.tabs.contact'), icon: Phone, color: 'purple' },
    { id: 'hours', label: t('dashboard.editBusiness.tabs.hours'), icon: Clock, color: 'orange' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header moderne avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push("/dashboard/businesses")} 
                variant="ghost" 
                size="sm" 
                className="hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('dashboard.editBusiness.back')}</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Edit3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {formData.name || t('dashboard.editBusiness.modifyBusiness')}
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    {t('dashboard.editBusiness.customizeOnlinePresence')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unsavedChanges && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  <span>{t('dashboard.editBusiness.unsaved')}</span>
                </div>
              )}
              
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline ml-2">{t('dashboard.editBusiness.deleteButton')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation par onglets moderne */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25 scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-emerald-900">{t('dashboard.editBusiness.generalInfo.title')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>{t('dashboard.editBusiness.generalInfo.businessName')}</span>
                        <span className="text-red-500">{t('dashboard.editBusiness.generalInfo.required')}</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t('dashboard.editBusiness.generalInfo.businessNamePlaceholder')}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 text-base"
                        required
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>{t('dashboard.editBusiness.generalInfo.category')}</span>
                        <span className="text-red-500">{t('dashboard.editBusiness.generalInfo.required')}</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 h-12 text-base bg-white"
                        required
                      >
                        <option value="">{t('dashboard.editBusiness.generalInfo.selectCategory')}</option>
                        {businessCategories.map((category) => (
                          <option key={category} value={category}>
                            {t(`categories.${category}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800">
                      {t('dashboard.editBusiness.generalInfo.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder={t('dashboard.editBusiness.generalInfo.descriptionPlaceholder')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 resize-none text-base"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800">
                      {t('dashboard.editBusiness.generalInfo.services')}
                    </label>
                    <Input
                      value={formData.services}
                      onChange={(e) => handleInputChange("services", e.target.value)}
                      placeholder={t('dashboard.editBusiness.generalInfo.servicesPlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Images */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-blue-900">{t('dashboard.editBusiness.images.title')}</span>
                        <p className="text-sm text-blue-700 font-normal">
                          {formData.images.length}/8 images • {formData.heroImage ? t('dashboard.editBusiness.images.heroImageSet') : t('dashboard.editBusiness.images.noHeroImage')}
                        </p>
                      </div>
                    </div>
                    {isSavingImages && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">{t('dashboard.editBusiness.images.saving')}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Zone d'upload améliorée */}
                  <div className="mb-8">
                    <ImageUpload
                      value=""
                      onChange={(url) => handleAddImage(url)}
                      disabled={isSubmitting || formData.images.length >= 8}
                      placeholder={formData.images.length >= 8 ? t('dashboard.editBusiness.images.uploadPlaceholderLimit') : t('dashboard.editBusiness.images.uploadPlaceholder')}
                      aspectRatio="video"
                      className="border-2 border-dashed border-blue-300 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl transition-all duration-300"
                    />
                  </div>

                  {/* Galerie d'images moderne */}
                  {formData.images.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.editBusiness.images.yourImages')}</h3>
                        <div className="text-sm text-gray-600">
                          {t('dashboard.editBusiness.images.clickToSetMain')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div
                            key={`${imageUrl}-${index}`}
                            className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                              formData.heroImage === imageUrl 
                                ? 'ring-4 ring-orange-500 ring-offset-2 shadow-xl shadow-orange-500/25 scale-105' 
                                : 'hover:scale-105 hover:shadow-xl hover:shadow-black/10'
                            }`}
                            onClick={() => handleSetHeroImage(imageUrl)}
                          >
                            <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden relative">
                              <S3Image
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            
                            {/* Badge Hero avec animation */}
                            {formData.heroImage === imageUrl && (
                              <div className="absolute bottom-2 left-2 z-10 animate-pulse">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>{t('dashboard.editBusiness.images.principal')}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Bouton de suppression moderne */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveImage(index)
                              }}
                              className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-30 border-2 border-white hover:scale-110"
                              title={t('dashboard.editBusiness.images.deleteImage')}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            {/* Numéro d'image */}
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                #{index + 1}
                              </div>
                            </div>
                            
                            {/* Overlay avec effet */}
                            <div className={`absolute inset-0 transition-all duration-300 ${
                              formData.heroImage === imageUrl 
                                ? 'bg-gradient-to-t from-orange-500/20 to-transparent' 
                                : 'bg-black/0 group-hover:bg-gradient-to-t group-hover:from-blue-500/20 group-hover:to-transparent'
                            }`} />
                          </div>
                        ))}
                      </div>
                      
                      {/* Conseils améliorés */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-blue-900">
                              {t('dashboard.editBusiness.images.optimizeImages')}
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-2">
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{t('dashboard.editBusiness.images.tips.mainImage')}</span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{t('dashboard.editBusiness.images.tips.highQuality')}</span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{t('dashboard.editBusiness.images.tips.showProducts')}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">{t('dashboard.editBusiness.images.noImages.title')}</p>
                          <p className="text-gray-400 text-sm mt-1">{t('dashboard.editBusiness.images.noImages.subtitle')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-purple-900">{t('dashboard.editBusiness.contactInfo.title')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span>{t('dashboard.editBusiness.contactInfo.fullAddress')}</span>
                      <span className="text-red-500">{t('dashboard.editBusiness.generalInfo.required')}</span>
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder={t('dashboard.editBusiness.contactInfo.addressPlaceholder')}
                      className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span>{t('dashboard.editBusiness.contactInfo.phone')}</span>
                        <span className="text-red-500">{t('dashboard.editBusiness.generalInfo.required')}</span>
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder={t('dashboard.editBusiness.contactInfo.phonePlaceholder')}
                        className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span>{t('dashboard.editBusiness.contactInfo.email')}</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={t('dashboard.editBusiness.contactInfo.emailPlaceholder')}
                        className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span>{t('dashboard.editBusiness.contactInfo.socialMedia')}</span>
                    </label>
                    <p className="text-xs text-gray-500">{t('dashboard.editBusiness.contactInfo.socialMediaHint')}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Facebook</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                          <Input
                            value={formData.facebook}
                            onChange={(e) => handleInputChange("facebook", e.target.value)}
                            placeholder="username"
                            className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base pl-8"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Instagram</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                          <Input
                            value={formData.instagram}
                            onChange={(e) => handleInputChange("instagram", e.target.value)}
                            placeholder="username"
                            className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base pl-8"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">TikTok</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                          <Input
                            value={formData.tiktok}
                            onChange={(e) => handleInputChange("tiktok", e.target.value)}
                            placeholder="username"
                            className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base pl-8"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">YouTube</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                          <Input
                            value={formData.youtube}
                            onChange={(e) => handleInputChange("youtube", e.target.value)}
                            placeholder="username"
                            className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Horaires */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-orange-900">{t('dashboard.editBusiness.hours.title')}</span>
                        <p className="text-sm text-orange-700 font-normal">
                          {t('dashboard.editBusiness.hours.subtitle')}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyToAllWeek}
                      className="rounded-xl hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                    >
                      {t('dashboard.editBusiness.hours.applyToAll')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {daysOfWeek.map((day) => {
                      const dayHours = formData.hours[day.key] || { open: '', close: '', closed: false }
                      const dayLabel = t(`dashboard.editBusiness.hours.${day.key}`)
                      return (
                        <div key={day.key} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl border border-gray-100">
                          <div className="w-28">
                            <label className="text-sm font-semibold text-gray-800">
                              {dayLabel}
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-1">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dayHours.closed}
                                onChange={(e) => handleHoursChange(day.key, 'closed', e.target.checked)}
                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <span className="text-sm font-medium text-gray-600">{t('dashboard.editBusiness.hours.closed')}</span>
                            </label>
                            
                            {!dayHours.closed && (
                              <>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={dayHours.open}
                                    onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                  >
                                    <option value="">{t('dashboard.editBusiness.hours.opening')}</option>
                                    {Array.from({ length: 24 }, (_, i) => {
                                      const hour = i.toString().padStart(2, '0')
                                      return (
                                        <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>
                                      )
                                    })}
                                  </select>
                                  
                                  <span className="text-gray-400 font-medium">-</span>
                                  
                                  <select
                                    value={dayHours.close}
                                    onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                  >
                                    <option value="">{t('dashboard.editBusiness.hours.closing')}</option>
                                    {Array.from({ length: 24 }, (_, i) => {
                                      const hour = i.toString().padStart(2, '0')
                                      return (
                                        <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>
                                      )
                                    })}
                                  </select>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Onglet Personnaliser */}
          {/* Boutons d'action fixes en bas */}
          <div className="sticky bottom-0 z-40 bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-lg shadow-black/5 p-4 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {unsavedChanges ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>{t('dashboard.editBusiness.actions.unsavedChanges')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('dashboard.editBusiness.actions.allSaved')}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/business/${formData.subdomain}`)}
                  className="flex-1 sm:flex-none rounded-xl border-gray-300 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('dashboard.editBusiness.actions.preview')}
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('dashboard.editBusiness.actions.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('dashboard.editBusiness.actions.save')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 