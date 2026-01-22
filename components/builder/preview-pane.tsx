"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessPageConfigData } from "@/types/template"
import { Eye } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface PreviewPaneProps {
  config: BusinessPageConfigData
  businessId: string
}

export function PreviewPane({ config, businessId }: PreviewPaneProps) {
  const { t } = useLanguage()

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Eye className="mr-2 h-5 w-5" />
          {t('dashboard.builder.preview')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 rounded-lg p-4 min-h-[400px]">
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            {/* Hero Preview */}
            <div 
              className="h-32 flex items-center justify-center text-white"
              style={{
                background: config.theme.gradient 
                  ? `linear-gradient(to right, ${config.theme.gradient.from}, ${config.theme.gradient.to})`
                  : config.theme.primaryColor
              }}
            >
              <div className="text-center">
                <div className="text-lg font-bold">Prévisualisation</div>
                <div className="text-sm opacity-90">{config.templateKey}</div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4 space-y-3">
              {config.sections.services.enabled && (
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm font-medium mb-2">Services</div>
                  <div className={config.sections.services.display === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}>
                    <div className="text-xs bg-white p-2 rounded">Service 1</div>
                    <div className="text-xs bg-white p-2 rounded">Service 2</div>
                  </div>
                </div>
              )}

              {config.sections.about.enabled && (
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm font-medium mb-2">À propos</div>
                  <div className="text-xs text-gray-600">Description de l'entreprise...</div>
                </div>
              )}

              {config.sidebar && (
                <div className="bg-emerald-50 rounded p-3">
                  <div className="text-sm font-medium mb-2">Sidebar ({config.sidebar.position})</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    {config.sidebar.contact.phone && <div>☎ Téléphone</div>}
                    {config.sidebar.contact.email && <div>✉ Email</div>}
                    {config.sidebar.hours.enabled && <div>🕐 Horaires</div>}
                    {config.sidebar.address.enabled && <div>📍 Adresse</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Aperçu simplifié - La page complète sera visible après publication
        </p>
      </CardContent>
    </Card>
  )
}

