"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateKey } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { Check, Layout } from "lucide-react"

interface TemplateSelectorProps {
  selected: TemplateKey
  onChange: (key: TemplateKey) => void
}

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const { t } = useLanguage()

  const templates = [
    {
      key: "sidebar-right" as TemplateKey,
      name: t('dashboard.builder.templates.sidebarRight'),
      description: t('dashboard.builder.templates.sidebarRightDesc'),
      icon: "→"
    },
    {
      key: "sidebar-left" as TemplateKey,
      name: t('dashboard.builder.templates.sidebarLeft'),
      description: t('dashboard.builder.templates.sidebarLeftDesc'),
      icon: "←"
    },
    {
      key: "hero-full" as TemplateKey,
      name: t('dashboard.builder.templates.heroFull'),
      description: t('dashboard.builder.templates.heroFullDesc'),
      icon: "⬌"
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('dashboard.builder.selectTemplate')}</h3>
        <p className="text-sm text-gray-600">Choisissez le layout de votre page</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card
            key={template.key}
            className={`cursor-pointer transition-all ${
              selected === template.key
                ? 'border-emerald-500 border-2 bg-emerald-50/50'
                : 'border-gray-200 hover:border-emerald-300'
            }`}
            onClick={() => onChange(template.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <h4 className="font-semibold text-base">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
                {selected === template.key && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

