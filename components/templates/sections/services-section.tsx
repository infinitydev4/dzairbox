"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"

interface ServicesSectionProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function ServicesSection({ business, config }: ServicesSectionProps) {
  const { t } = useLanguage()
  const [showAll, setShowAll] = useState(false)

  if (!config.sections.services.enabled) return null

  const services = business.services 
    ? business.services.split(',').map(s => s.trim()).filter(Boolean)
    : []

  if (services.length === 0) return null

  const title = config.sections.services.title || t('business.page.services')
  const displayMode = config.sections.services.display
  const displayedServices = showAll ? services : services.slice(0, 6)

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <span className="mr-2" style={{ color: config.theme.primaryColor }}>⚙</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedServices.map((service, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg transition-all"
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: `${config.theme.primaryColor}33`, // 20% opacity
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${config.theme.primaryColor}, ${config.theme.secondaryColor})`
                  }}
                ></div>
                <span className="text-gray-800 font-medium">{service}</span>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {displayedServices.map((service, index) => (
              <li key={index} className="flex items-center space-x-3 py-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.theme.primaryColor }}
                ></div>
                <span className="text-gray-800">{service}</span>
              </li>
            ))}
          </ul>
        )}
        
        {services.length > 6 && (
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="ghost"
            className="mt-4"
            style={{ color: config.theme.primaryColor }}
          >
            {showAll ? (
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
  )
}

