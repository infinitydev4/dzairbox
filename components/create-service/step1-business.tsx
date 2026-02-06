"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { businessCategories, daysOfWeek } from "@/lib/constants"
import { 
  Building2, 
  MapPin, 
  Clock, 
  Loader2,
  Save,
  Trash2
} from "lucide-react"

interface CreateServiceStep1Props {
  onComplete: (data: any, token: string) => void
}

const CACHE_KEY = 'dzairbox_public_business_draft'

export function CreateServiceStep1({ onComplete }: CreateServiceStep1Props) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCachedData, setHasCachedData] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Utiliser les labels traduits pour les jours
  const getDayLabel = (dayKey: string) => {
    const translations: Record<string, string> = {
      "sunday": t("dashboard.createForm.hours.day.sunday"),
      "monday": t("dashboard.createForm.hours.day.monday"),
      "tuesday": t("dashboard.createForm.hours.day.tuesday"),
      "wednesday": t("dashboard.createForm.hours.day.wednesday"),
      "thursday": t("dashboard.createForm.hours.day.thursday"),
      "friday": t("dashboard.createForm.hours.day.friday"),
      "saturday": t("dashboard.createForm.hours.day.saturday")
    }
    return translations[dayKey] || dayKey
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

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      const hasData = formData.name || formData.category || formData.description || formData.address
      if (hasData) {
        setIsSaving(true)
        localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
        setHasCachedData(true)
        
        setTimeout(() => setIsSaving(false), 1000)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData])

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

  useEffect(() => {
    const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google) return

      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'dz' },
          fields: ['formatted_address', 'address_components', 'geometry']
        }
      )

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
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      const numbers = value.replace(/\D/g, "")
      const limitedNumbers = numbers.slice(0, 9)
      
      let formatted = ""
      if (limitedNumbers.length > 0) {
        const parts = []
        for (let i = 0; i < limitedNumbers.length; i += 3) {
          parts.push(limitedNumbers.slice(i, i + 3))
        }
        formatted = parts.join(" ")
      }
      
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
        hours: formattedHours,
        temporary: true
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
        localStorage.removeItem(CACHE_KEY)
        
        toast({
          title: t("createService.step1.success"),
          description: t("createService.step1.successDesc"),
        })
        
        onComplete(dataToSend, result.token)
      } else {
        toast({
          title: t("dashboard.createForm.errors.title"),
          description: result.error || t("dashboard.createForm.errors.unexpected"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating pending business:", error)
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
    <div className="space-y-4 sm:space-y-8">
      {hasCachedData && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 max-w-4xl mx-auto px-4 sm:px-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm w-full sm:w-auto justify-center">
            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span>{isSaving ? t("dashboard.createForm.draft.saving") : t("dashboard.createForm.draft.saved")}</span>
          </div>
          <Button 
            onClick={clearCache} 
            variant="outline" 
            size="sm" 
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl w-full sm:w-auto text-xs sm:text-sm"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {t("dashboard.createForm.draft.clear")}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-0">
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <span>{t("dashboard.createForm.general.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.general.name")} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("dashboard.createForm.general.namePlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.general.category")} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm sm:text-base"
                  required
                >
                  <option value="">{t("dashboard.createForm.general.categoryPlaceholder")}</option>
                  {businessCategories.map((category) => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                {t("dashboard.createForm.general.description")} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t("dashboard.createForm.general.descriptionPlaceholder")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none resize-none text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                {t("dashboard.createForm.general.services")}
              </label>
              <Input
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                placeholder={t("dashboard.createForm.general.servicesPlaceholder")}
                className="rounded-xl text-sm sm:text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <span>{t("dashboard.createForm.location.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                {t("dashboard.createForm.location.address")} *
              </label>
              <Input
                ref={addressInputRef}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("dashboard.createForm.location.addressPlaceholder")}
                className="rounded-xl text-sm sm:text-base"
                required
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">{t("dashboard.createForm.location.addressHelper")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.contact.phone")} *
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center">
                    <div className="flex items-center gap-1 sm:gap-2 pl-2 sm:pl-4 pr-2 sm:pr-3 border-r border-gray-200">
                      <span className="text-lg sm:text-2xl">🇩🇿</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">+213</span>
                    </div>
                  </div>
                  <Input
                    type="tel"
                    value={formData.phone.replace('+213 ', '')}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t("dashboard.createForm.contact.phonePlaceholder")}
                    className="rounded-xl pl-[90px] sm:pl-[120px] text-sm"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t("dashboard.createForm.contact.phoneHelper")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {t("dashboard.createForm.contact.email")} {t("dashboard.createForm.contact.emailOptional")}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("dashboard.createForm.contact.emailPlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{t("dashboard.createForm.social.title")}</h3>
              <p className="text-xs text-gray-500">{t("dashboard.createForm.social.description")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.facebook")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <Input
                      value={formData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      placeholder={t("dashboard.createForm.social.facebookPlaceholder")}
                      className="rounded-xl pl-8 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.instagram")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder={t("dashboard.createForm.social.instagramPlaceholder")}
                      className="rounded-xl pl-8 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.tiktok")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <Input
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange("tiktok", e.target.value)}
                      placeholder={t("dashboard.createForm.social.tiktokPlaceholder")}
                      className="rounded-xl pl-8 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("dashboard.createForm.social.youtube")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <Input
                      value={formData.youtube}
                      onChange={(e) => handleInputChange("youtube", e.target.value)}
                      placeholder={t("dashboard.createForm.social.youtubePlaceholder")}
                      className="rounded-xl pl-8 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <span className="text-base sm:text-lg">{t("dashboard.createForm.hours.title")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyToAllWeek}
                className="rounded-xl text-xs w-full sm:w-auto"
              >
                {t("dashboard.createForm.hours.description")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {daysOfWeek.map((day) => {
                const dayHours = formData.hours[day.key] || { open: '', close: '', closed: false }
                return (
                  <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="sm:w-24">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {getDayLabel(day.key)}
                      </label>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayHours.closed}
                          onChange={(e) => handleHoursChange(day.key, 'closed', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-600">{t("dashboard.createForm.hours.closed")}</span>
                      </label>
                      
                      {!dayHours.closed && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <select
                            value={dayHours.open}
                            onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                            className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
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
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end px-4 sm:px-0">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl py-3 sm:py-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("dashboard.createForm.submit.submitting")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("createService.step1.continue")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
