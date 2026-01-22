"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"

interface AboutSectionProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function AboutSection({ business, config }: AboutSectionProps) {
  const { t } = useLanguage()

  if (!config.sections.about.enabled) return null

  const content = config.sections.about.content || business.description

  if (!content) return null

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t('business.page.about')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-emerald max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {content}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${config.theme.primaryColor}1A`, // 10% opacity
              color: config.theme.primaryColor
            }}
          >
            {business.category}
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <MapPin className="w-3 h-3 mr-1" />
            Algérie
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

