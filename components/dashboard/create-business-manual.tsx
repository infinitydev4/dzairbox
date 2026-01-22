"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { 
  Building2, 
  MapPin, 
  Clock, 
  Loader2,
  ArrowLeft,
  Save,
  Trash2
} from "lucide-react"

interface CreateBusinessManualProps {
  onBack?: () => void // Optionnel maintenant
}

const CACHE_KEY = 'dzairbox_business_draft'

const businessCategories = [
  "Restaurant", "Café", "Boulangerie", "Pâtisserie",
  "Coiffeur", "Salon de beauté", "Spa",
  "Mécanicien", "Garage", "Électricien", "Plombier", "Peintre", "Menuisier",
  "Pharmacie", "Clinique", "Médecin", "Dentiste", "Centre médical",
  "Épicerie", "Supermarché", "Boucherie",
  "Vêtements", "Chaussures", "Bijouterie",
  "Informatique", "Électronique", "Téléphonie",
  "Hôtel", "Maison d'hôtes", "Agence de voyage",
  "Avocat", "Comptable", "Notaire",
  "Auto-école", "École", "Formation",
  "Salle de sport", "Sport",
  "Librairie", "Papeterie",
  "Artisanat", "Décoration",
  "Entretien", "Ménage", "Jardinage",
  "Immobilier", "Architecture",
  "Photographe", "Imprimerie",
  "Transport", "Livraison",
  "Autre"
].sort()

// Les jours seront traduits dynamiquement dans le composant

export function CreateBusinessManual({ onBack }: CreateBusinessManualProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCachedData, setHasCachedData] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Jours de la semaine traduits
  const daysOfWeek = [
    { key: "sunday", label: t("dashboard.createForm.hours.day.sunday") },
    { key: "monday", label: t("dashboard.createForm.hours.day.monday") },
    { key: "tuesday", label: t("dashboard.createForm.hours.day.tuesday") },
    { key: "wednesday", label: t("dashboard.createForm.hours.day.wednesday") },
    { key: "thursday", label: t("dashboard.createForm.hours.day.thursday") },
    { key: "friday", label: t("dashboard.createForm.hours.day.friday") },
    { key: "saturday", label: t("dashboard.createForm.hours.day.saturday") }
  ]

  // Fonction pour gérer le retour
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/dashboard')
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "+213 ",
    email: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    services: "",
    hours: {} as Record<string, { open: string; close: string; closed: boolean }>
  })

  // Charger les données en cache au montage du composant
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsedData = JSON.parse(cached)
          setFormData(parsedData)
          setHasCachedData(true)
          toast({
            title: t("dashboard.createForm.draft.restored"),
            description: t("dashboard.createForm.draft.restoredDesc"),
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement du cache:", error)
      }
    }

    loadCachedData()
  }, [toast, t])

  // Sauvegarder automatiquement les données toutes les 2 secondes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      // Ne sauvegarder que si au moins un champ est rempli
      const hasData = formData.name || formData.category || formData.description || formData.address
      if (hasData) {
        setIsSaving(true)
        localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
        setHasCachedData(true)
        
        // Masquer l'indicateur après 1 seconde
        setTimeout(() => setIsSaving(false), 1000)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData])

  // Fonction pour effacer le cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    setFormData({
      name: "",
      category: "",
      description: "",
      address: "",
      phone: "+213 ",
      email: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      services: "",
      hours: {} as Record<string, { open: string; close: string; closed: boolean }>
    })
    setHasCachedData(false)
    toast({
      title: t("dashboard.createForm.draft.cleared"),
      description: t("dashboard.createForm.draft.clearedDesc"),
    })
  }

  // Initialiser Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google) return

      // Créer l'autocomplete avec focus sur l'Algérie
      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'dz' }, // Restreindre à l'Algérie
          fields: ['formatted_address', 'address_components', 'geometry']
        }
      )

      // Écouter la sélection d'une adresse
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          setFormData(prev => ({
            ...prev,
            address: place.formatted_address || ''
          }))
        }
      })
    }

    // Charger le script Google Maps si ce n'est pas déjà fait
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=fr`
      script.async = true
      script.defer = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      initAutocomplete()
    }

    return () => {
      // Nettoyer les listeners
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    // Gestion spéciale pour le champ téléphone
    if (field === "phone") {
      // Nettoyer la valeur : ne garder que les chiffres
      const numbers = value.replace(/\D/g, "")
      
      // Limiter à 9 chiffres (format algérien)
      const limitedNumbers = numbers.slice(0, 9)
      
      // Formater le numéro : XXX XXX XXX
      let formatted = ""
      if (limitedNumbers.length > 0) {
        const parts = []
        for (let i = 0; i < limitedNumbers.length; i += 3) {
          parts.push(limitedNumbers.slice(i, i + 3))
        }
        formatted = parts.join(" ")
      }
      
      // Toujours ajouter +213 au début pour le stockage
      value = "+213 " + formatted
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => {
      const currentHours = prev.hours[day] || { open: '', close: '', closed: false }
      
      if (field === 'closed') {
        return {
          ...prev,
          hours: { 
            ...prev.hours, 
            [day]: { ...currentHours, closed: value as boolean, open: '', close: '' }
          }
        }
      }
      
      return {
        ...prev,
        hours: { 
          ...prev.hours, 
          [day]: { ...currentHours, [field]: value as string }
        }
      }
    })
  }

  const applyToAllWeek = () => {
    const sundayHours = formData.hours["sunday"]
    if (!sundayHours) return
    
    const newHours: Record<string, { open: string; close: string; closed: boolean }> = {}
    daysOfWeek.forEach(day => {
      newHours[day.key] = { ...sundayHours }
    })
    
    setFormData(prev => ({
      ...prev,
      hours: newHours
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.category || !formData.description || !formData.address || !formData.phone) {
        toast({
          title: t("dashboard.createForm.errors.title"),
          description: t("dashboard.createForm.errors.required"),
          variant: "destructive"
        })
        return
      }

      // Formater les horaires pour l'envoi au format JSON
      const formattedHours: Record<string, { open: string; close: string; closed: boolean }> = {}
      Object.entries(formData.hours).forEach(([day, hours]) => {
        formattedHours[day] = {
          open: hours.open || '',
          close: hours.close || '',
          closed: hours.closed || false
        }
      })

      const dataToSend = {
        ...formData,
        hours: formattedHours
      }

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()

      if (response.ok) {
        // Effacer le cache après une création réussie
        localStorage.removeItem(CACHE_KEY)
        
        toast({
          title: t("dashboard.createForm.success.title"),
          description: result.message || t("dashboard.createForm.success.message"),
        })
        router.push("/dashboard/businesses")
      } else {
        toast({
          title: t("dashboard.createForm.errors.title"),
          description: result.error || t("dashboard.createForm.errors.unexpected"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating business:", error)
      toast({
        title: t("dashboard.createForm.errors.title"),
        description: t("dashboard.createForm.errors.unexpected"),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button onClick={handleBack} variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>{t("dashboard.createForm.back")}</span>
        </Button>

        {hasCachedData && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{isSaving ? t("dashboard.createForm.draft.saving") : t("dashboard.createForm.draft.saved")}</span>
            </div>
            <Button 
              onClick={clearCache} 
              variant="outline" 
              size="sm" 
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("dashboard.createForm.draft.clear")}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <span>{t("dashboard.createForm.general.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.general.name")} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("dashboard.createForm.general.namePlaceholder")}
                  className="rounded-xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.general.category")} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  required
                >
                  <option value="">{t("dashboard.createForm.general.categoryPlaceholder")}</option>
                  {businessCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("dashboard.createForm.general.description")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t("dashboard.createForm.general.descriptionPlaceholder")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("dashboard.createForm.general.services")}
              </label>
              <Input
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                placeholder={t("dashboard.createForm.general.servicesPlaceholder")}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <span>{t("dashboard.createForm.location.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("dashboard.createForm.location.address")} *
              </label>
              <Input
                ref={addressInputRef}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("dashboard.createForm.location.addressPlaceholder")}
                className="rounded-xl"
                required
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">{t("dashboard.createForm.location.addressHelper")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.contact.phone")} *
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center">
                    <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-200">
                      <span className="text-2xl">🇩🇿</span>
                      <span className="text-sm font-semibold text-gray-700">+213</span>
                    </div>
                  </div>
                  <Input
                    type="tel"
                    value={formData.phone.replace('+213 ', '')}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t("dashboard.createForm.contact.phonePlaceholder")}
                    className="rounded-xl pl-[120px]"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t("dashboard.createForm.contact.phoneHelper")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.contact.email")} {t("dashboard.createForm.contact.emailOptional")}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("dashboard.createForm.contact.emailPlaceholder")}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">{t("dashboard.createForm.social.title")}</h3>
              <p className="text-xs text-gray-500">{t("dashboard.createForm.social.description")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.facebook")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <Input
                      value={formData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      placeholder={t("dashboard.createForm.social.facebookPlaceholder")}
                      className="rounded-xl pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.instagram")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder={t("dashboard.createForm.social.instagramPlaceholder")}
                      className="rounded-xl pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.tiktok")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <Input
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange("tiktok", e.target.value)}
                      placeholder={t("dashboard.createForm.social.tiktokPlaceholder")}
                      className="rounded-xl pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.youtube")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <Input
                      value={formData.youtube}
                      onChange={(e) => handleInputChange("youtube", e.target.value)}
                      placeholder={t("dashboard.createForm.social.youtubePlaceholder")}
                      className="rounded-xl pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <span>{t("dashboard.createForm.hours.title")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyToAllWeek}
                className="rounded-xl text-xs"
              >
                {t("dashboard.createForm.hours.description")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const dayHours = formData.hours[day.key] || { open: '', close: '', closed: false }
                return (
                  <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-24">
                      <label className="text-sm font-medium text-gray-700">
                        {day.label}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayHours.closed}
                          onChange={(e) => handleHoursChange(day.key, 'closed', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-600">{t("dashboard.createForm.hours.closed")}</span>
                      </label>
                      
                      {!dayHours.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <select
                              value={dayHours.open}
                              onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">{t("dashboard.createForm.hours.opening")}</option>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0')
                                return (
                                  <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>
                                )
                              })}
                            </select>
                            
                            <span className="text-gray-400">-</span>
                            
                            <select
                              value={dayHours.close}
                              onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">{t("dashboard.createForm.hours.closing")}</option>
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

        <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto rounded-xl"
          >
            {t("dashboard.createForm.submit.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("dashboard.createForm.submit.submitting")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("dashboard.createForm.submit.submit")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 