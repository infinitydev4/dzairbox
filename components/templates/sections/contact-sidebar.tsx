"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Clock, MapPin, Navigation, Facebook, Instagram, Youtube } from "lucide-react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { daysOfWeek } from "@/lib/constants"
import Image from "next/image"

interface ContactSidebarProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function ContactSidebar({ business, config }: ContactSidebarProps) {
  const { t, language } = useLanguage()

  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`
    }
  }

  const handleEmail = () => {
    if (business.email) {
      window.location.href = `mailto:${business.email}`
    }
  }

  const handleDirections = () => {
    const query = encodeURIComponent(business.address)
    window.open(`https://maps.google.com/?q=${query}`, '_blank')
  }

  const handleSocialMedia = (platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube', username: string) => {
    if (!username) return
    
    const cleanUsername = username.replace('@', '').trim()
    
    let url = ''
    switch (platform) {
      case 'facebook':
        url = `https://facebook.com/${cleanUsername}`
        break
      case 'instagram':
        url = `https://instagram.com/${cleanUsername}`
        break
      case 'tiktok':
        url = `https://tiktok.com/@${cleanUsername}`
        break
      case 'youtube':
        url = `https://youtube.com/@${cleanUsername}`
        break
    }
    
    window.open(url, '_blank')
  }

  // Parse hours
  const parseHours = (hours: string | null | any) => {
    if (!hours) return null
    if (typeof hours === 'object' && hours !== null) return hours
    if (typeof hours === 'string') {
      try {
        const hoursData = JSON.parse(hours)
        if (typeof hoursData === 'object' && hoursData !== null) return hoursData
      } catch {
        return null
      }
    }
    return null
  }

  const parsedHours = parseHours(business.hours)

  // Fonction pour obtenir le label traduit d'un jour
  const getDayLabel = (dayKey: string) => {
    const translations: Record<string, string> = {
      "sunday": t('days.sunday'),
      "monday": t('days.monday'),
      "tuesday": t('days.tuesday'),
      "wednesday": t('days.wednesday'),
      "thursday": t('days.thursday'),
      "friday": t('days.friday'),
      "saturday": t('days.saturday')
    }
    return translations[dayKey] || dayKey
  }

  if (!config.sidebar) return null

  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('business.page.contact')}</CardTitle>
          <CardDescription>{t('business.page.contactDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {config.sidebar.contact.phone && business.phone && (
            <Button 
              onClick={handleCall}
              className="w-full text-white text-lg py-6 rounded-xl shadow-lg transition-all"
              style={{
                backgroundColor: config.theme.primaryColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = config.theme.secondaryColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = config.theme.primaryColor
              }}
            >
              <Phone className="mr-2 h-5 w-5" />
              <span dir="ltr">{business.phone}</span>
            </Button>
          )}

          {config.sidebar.contact.email && business.email && (
            <Button 
              onClick={handleEmail}
              variant="outline" 
              className="w-full text-lg py-6 rounded-xl transition-all"
              style={{
                borderColor: `${config.theme.primaryColor}33`, // 20% opacity
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${config.theme.primaryColor}0D` // 5% opacity
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Mail className="mr-2 h-5 w-5" />
              {t('business.page.sendEmail')}
            </Button>
          )}

          {/* Réseaux sociaux */}
          {(business.facebook || business.instagram || business.tiktok || business.youtube) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mt-4">Réseaux sociaux</p>
              <div className="grid grid-cols-2 gap-2">
                {config.sidebar.socials.facebook && business.facebook && (
                  <Button 
                    onClick={() => handleSocialMedia('facebook', business.facebook!)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-blue-200 hover:bg-blue-50"
                  >
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                )}
                
                {config.sidebar.socials.instagram && business.instagram && (
                  <Button 
                    onClick={() => handleSocialMedia('instagram', business.instagram!)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-pink-200 hover:bg-pink-50"
                  >
                    <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                    Instagram
                  </Button>
                )}
                
                {config.sidebar.socials.tiktok && business.tiktok && (
                  <Button 
                    onClick={() => handleSocialMedia('tiktok', business.tiktok!)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <Image src="/tiktok-icon.svg" alt="TikTok" width={16} height={16} className="mr-2" />
                    TikTok
                  </Button>
                )}
                
                {config.sidebar.socials.youtube && business.youtube && (
                  <Button 
                    onClick={() => handleSocialMedia('youtube', business.youtube!)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-red-200 hover:bg-red-50"
                  >
                    <Youtube className="mr-2 h-4 w-4 text-red-600" />
                    YouTube
                  </Button>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={handleDirections}
            variant="outline" 
            className="w-full text-lg py-6 rounded-xl transition-all"
            style={{
              borderColor: `${config.theme.primaryColor}33`, // 20% opacity
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${config.theme.primaryColor}0D` // 5% opacity
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Navigation className="mr-2 h-5 w-5" />
            {t('business.page.directions')}
          </Button>
        </CardContent>
      </Card>

      {/* Hours Card */}
      {config.sidebar.hours.enabled && parsedHours && Object.keys(parsedHours).length > 0 && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Clock className="mr-2 h-5 w-5" style={{ color: config.theme.primaryColor }} />
              {t('business.page.hours')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {daysOfWeek.map((day) => {
                const dayHours = parsedHours[day.key]
                if (!dayHours || (!dayHours.open && !dayHours.close && !dayHours.closed)) return null
                
                return (
                  <div key={day.key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{getDayLabel(day.key)}</span>
                    <span className="text-gray-600">
                      {dayHours.closed 
                        ? t('dashboard.editBusiness.hours.closed') || 'Fermé'
                        : `${dayHours.open || '00:00'} - ${dayHours.close || '00:00'}`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Card */}
      {config.sidebar.address.enabled && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" style={{ color: config.theme.primaryColor }} />
              {t('business.page.address')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{business.address}</p>
            <Button 
              onClick={handleDirections}
              className="w-full text-white transition-all"
              style={{
                backgroundColor: config.theme.primaryColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = config.theme.secondaryColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = config.theme.primaryColor
              }}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {t('business.page.openInMaps')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

