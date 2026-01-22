"use client"

import { Button } from "@/components/ui/button"
import { Phone, Navigation, Share2 } from "lucide-react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { useState } from "react"
import { getBusinessFullUrl } from "@/lib/business-url"

interface HeroSectionProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function HeroSection({ business, config }: HeroSectionProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`
    }
  }

  const handleDirections = () => {
    const query = encodeURIComponent(business.address)
    window.open(`https://maps.google.com/?q=${query}`, '_blank')
  }

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

  if (!config.hero.enabled) return null

  const title = config.hero.title || business.name
  const description = config.hero.description || business.description

  // Build background style based on config
  let backgroundStyle: React.CSSProperties = {}
  let backgroundClasses = ""
  
  if (config.hero.backgroundType === "image" && config.hero.backgroundImage) {
    backgroundStyle = {
      backgroundImage: `url(${config.hero.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
    backgroundClasses = "relative"
  } else if (config.hero.backgroundType === "gradient" && config.theme.gradient) {
    backgroundClasses = config.hero.backgroundValue || `bg-gradient-to-r from-[${config.theme.gradient.from}] to-[${config.theme.gradient.to}]`
  } else if (config.hero.backgroundType === "color") {
    // Use inline style for dynamic color
    backgroundStyle = {
      backgroundColor: config.theme.primaryColor
    }
    backgroundClasses = "relative"
  } else {
    backgroundClasses = config.hero.backgroundValue
  }

  return (
    <div className={`relative ${backgroundClasses} text-white`} style={backgroundStyle}>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            {t('business.page.activeStatus')}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-emerald-100">
            <span className="text-lg md:text-xl font-medium">{business.category}</span>
            <span className="text-emerald-300 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1">
              <span className="text-sm md:text-base">{business.address.split(',')[0]}</span>
            </div>
          </div>

          {description && (
            <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          {config.hero.showCTA && (
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              {business.phone && (
                <Button 
                  onClick={handleCall}
                  size="lg"
                  className="bg-white shadow-xl hover:shadow-2xl transition-all"
                  style={{
                    color: config.theme.primaryColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = config.theme.secondaryColor + '10' // 10% opacity
                    e.currentTarget.style.color = config.theme.secondaryColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                    e.currentTarget.style.color = config.theme.primaryColor
                  }}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {t('business.page.call')}
                </Button>
              )}
              
              <Button 
                onClick={handleDirections}
                size="lg"
                className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all"
              >
                <Navigation className="mr-2 h-5 w-5" />
                {t('business.page.directions')}
              </Button>

              <Button 
                onClick={handleShare}
                size="lg"
                className="border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all"
              >
                <Share2 className="mr-2 h-5 w-5" />
                {copied ? t('business.page.copied') : t('business.page.share')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

