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
  Globe, 
  Clock, 
  Star, 
  Share2, 
  Navigation,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Business {
  id: string
  name: string
  description: string | null
  category: string
  address: string
  phone: string | null
  email: string | null
  website: string | null
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

  const handleWebsite = () => {
    if (business.website) {
      let url = business.website
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      window.open(url, '_blank')
    }
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
                variant="outline" 
                className="border-white/50 text-black hover:bg-white/10 w-full sm:w-auto text-lg py-6 px-8 rounded-xl backdrop-blur-sm"
              >
                <Navigation className="mr-2 h-5 w-5" />
                {t('business.page.directions')}
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline"
                className="border-white/50 text-black hover:bg-white/10 w-full sm:w-auto text-lg py-6 px-8 rounded-xl backdrop-blur-sm"
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
          <div className="space-y-6">
            
            {/* Contact Card */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm sticky top-6">
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

                {business.website && (
                  <Button 
                    onClick={handleWebsite}
                    variant="outline" 
                    className="w-full text-lg py-6 rounded-xl border-emerald-200 hover:bg-emerald-50"
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    {t('business.page.website')}
                  </Button>
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
            {business.hours && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-emerald-600" />
                    {t('business.page.hours')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {business.hours.split(',').map((hour, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{hour.trim()}</span>
                      </div>
                    ))}
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