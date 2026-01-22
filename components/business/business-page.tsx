"use client"

import { useState } from "react"
import { getBusinessFullUrl } from "@/lib/business-url"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Share2, 
  Navigation,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Youtube
} from "lucide-react"

interface Business {
  id: string
  name: string
  description: string | null
  category: string
  address: string
  phone: string | null
  email: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  hours: string | null
  services: string | null
  subdomain: string
  user: {
    name: string | null
    email: string
  }
}

interface BusinessPageProps {
  business: Business
}

export function BusinessPage({ business }: BusinessPageProps) {
  const { t } = useLanguage()
  const [showAllServices, setShowAllServices] = useState(false)
  const [copied, setCopied] = useState(false)

  const services = business.services 
    ? business.services.split(',').map(s => s.trim()).filter(Boolean)
    : []

  // Parser les horaires
  const parseHours = (hours: string | null | any) => {
    if (!hours) return null
    
    // Si c'est déjà un objet, le retourner directement
    if (typeof hours === 'object' && hours !== null) {
      return hours
    }
    
    // Si c'est une string, essayer de parser
    if (typeof hours === 'string') {
      try {
        const hoursData = JSON.parse(hours)
        if (typeof hoursData === 'object' && hoursData !== null) {
          return hoursData
        }
      } catch {
        return null
      }
    }
    
    return null
  }

  const parsedHours = parseHours(business.hours)

  const daysOfWeek = [
    { key: "dimanche", label: t('days.sunday') },
    { key: "lundi", label: t('days.monday') },
    { key: "mardi", label: t('days.tuesday') },
    { key: "mercredi", label: t('days.wednesday') },
    { key: "jeudi", label: t('days.thursday') },
    { key: "vendredi", label: t('days.friday') },
    { key: "samedi", label: t('days.saturday') }
  ]

  const handleShare = async () => {
    const url = getBusinessFullUrl(business.subdomain)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description || `${t('business.meta.discover')} ${business.name}`,
          url: url,
        })
      } catch (error) {
        console.log('Erreur de partage:', error)
      }
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
    
    // Nettoyer le username (enlever @ si présent)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Header Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {t('business.page.activeStatus')}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {business.name}
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-emerald-100">
              <span className="text-lg md:text-xl font-medium">{business.category}</span>
              <span className="text-emerald-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm md:text-base">{business.address.split(',')[0]}</span>
              </div>
            </div>

            {business.description && (
              <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              {business.phone && (
                <Button 
                  onClick={handleCall}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto text-lg py-6 px-8 rounded-xl shadow-lg"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {t('business.page.call')}
                </Button>
              )}
              
              <Button 
                onClick={handleDirections}
                className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white w-full sm:w-auto text-lg py-6 px-8 rounded-xl backdrop-blur-sm transition-all"
              >
                <Navigation className="mr-2 h-5 w-5" />
                {t('business.page.directions')}
              </Button>
              
              <Button 
                onClick={handleShare}
                className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white w-full sm:w-auto text-lg py-6 px-8 rounded-xl backdrop-blur-sm transition-all"
              >
                <Share2 className="mr-2 h-5 w-5" />
                {copied ? t('business.page.copied') : t('business.page.share')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Services Section */}
            {services.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Star className="mr-3 h-6 w-6 text-emerald-600" />
                    {t('business.page.services')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.slice(0, showAllServices ? services.length : 6).map((service, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                        <span className="text-gray-800 font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                  
                  {services.length > 6 && (
                    <Button
                      onClick={() => setShowAllServices(!showAllServices)}
                      variant="ghost"
                      className="mt-4 text-emerald-600 hover:text-emerald-700"
                    >
                      {showAllServices ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          {t('business.page.showLess')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          {t('business.page.showMore')} ({services.length - 6} {t('business.page.others')})
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* About Section */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{t('business.page.about')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-emerald max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {business.description || `${business.name} ${t('business.page.aboutDefault')} ${business.category.toLowerCase()}${t('business.page.locatedAt')} ${business.address}.`}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                    {business.category}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    Algérie
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6 sticky top-6 self-start">
            
            {/* Contact Card */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">{t('business.page.contact')}</CardTitle>
                <CardDescription>{t('business.page.contactDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {business.phone && (
                  <Button 
                    onClick={handleCall}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6 rounded-xl shadow-lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {business.phone}
                  </Button>
                )}

                {business.email && (
                  <Button 
                    onClick={handleEmail}
                    variant="outline" 
                    className="w-full text-lg py-6 rounded-xl border-emerald-200 hover:bg-emerald-50"
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
                      {business.facebook && (
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
                      {business.instagram && (
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
                      {business.tiktok && (
                        <Button 
                          onClick={() => handleSocialMedia('tiktok', business.tiktok!)}
                          variant="outline" 
                          size="sm"
                          className="rounded-xl border-gray-200 hover:bg-gray-50"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                          TikTok
                        </Button>
                      )}
                      {business.youtube && (
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
                  className="w-full text-lg py-6 rounded-xl border-emerald-200 hover:bg-emerald-50"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  {t('business.page.directions')}
                </Button>
              </CardContent>
            </Card>

            {/* Hours Card */}
            {parsedHours && Object.keys(parsedHours).length > 0 && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-emerald-600" />
                    {t('business.page.hours')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {daysOfWeek.map((day) => {
                      const dayHours = parsedHours[day.key]
                      // N'afficher que les jours qui ont des données
                      if (!dayHours || (!dayHours.open && !dayHours.close && !dayHours.closed)) return null
                      
                      return (
                        <div key={day.key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-gray-700">{day.label}</span>
                          <span className="text-gray-600">
                            {dayHours.closed 
                              ? (t('dashboard.editBusiness.hours.closed') || 'Fermé')
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
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
                  {t('business.page.address')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{business.address}</p>
                <Button 
                  onClick={handleDirections}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {t('business.page.openInMaps')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 mt-12">
          <p className="text-gray-600 mb-2">
            {t('business.page.hostedOn')}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a 
              href="https://dzbusiness.dz" 
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t('business.page.createMyPage')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 