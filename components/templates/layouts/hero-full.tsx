"use client"

import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { HeroSection } from "../sections/hero-section"
import { ServicesSection } from "../sections/services-section"
import { AboutSection } from "../sections/about-section"
import { GallerySection } from "../sections/gallery-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Navigation, Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface HeroFullTemplateProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function HeroFullTemplate({ business, config }: HeroFullTemplateProps) {
  const { t } = useLanguage()

  const handleCall = () => {
    if (business.phone) window.location.href = `tel:${business.phone}`
  }

  const handleEmail = () => {
    if (business.email) window.location.href = `mailto:${business.email}`
  }

  const handleDirections = () => {
    const query = encodeURIComponent(business.address)
    window.open(`https://maps.google.com/?q=${query}`, '_blank')
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50"
      style={{
        '--primary': config.theme.primaryColor,
        '--secondary': config.theme.secondaryColor
      } as React.CSSProperties}
    >
      {/* Hero Section Full Width */}
      <HeroSection business={business} config={config} />

      {/* Main Content - Single Column */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Contact Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t('business.page.contact')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.phone && (
                  <Button 
                    onClick={handleCall}
                    className="w-full text-white py-6 transition-all"
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
                    {business.phone}
                  </Button>
                )}
                
                {business.email && (
                  <Button 
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full py-6 transition-all"
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
                    {business.email}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <ServicesSection business={business} config={config} />
          
          {/* About Section */}
          <AboutSection business={business} config={config} />

          {/* Gallery Section */}
          <GallerySection business={business} config={config} />

          {/* Location Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MapPin className="mr-2 h-5 w-5" style={{ color: config.theme.primaryColor }} />
                {t('business.page.address')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-lg">{business.address}</p>
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
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200 mt-12">
        <p className="text-gray-600 mb-2">
          Cette page est hébergée sur DzBox
        </p>
        <div className="flex items-center justify-center space-x-4">
          <a 
            href="https://dzbusiness.dz" 
            className="font-medium transition-colors hover:underline"
            style={{ 
              color: config.theme.primaryColor 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = config.theme.secondaryColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = config.theme.primaryColor
            }}
          >
            Créer ma page entreprise
          </a>
        </div>
      </div>
    </div>
  )
}

