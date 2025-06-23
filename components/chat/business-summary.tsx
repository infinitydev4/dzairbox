"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessData } from "./chat-interface"
import { useLanguage } from "@/components/language-provider"

interface BusinessSummaryProps {
  businessData: BusinessData
}

export function BusinessSummary({ businessData }: BusinessSummaryProps) {
  const { t } = useLanguage()
  
  const fields = [
    { key: "name", label: t('dashboard.chat.progress.fields.name'), icon: "🏢" },
    { key: "category", label: t('dashboard.chat.progress.fields.category'), icon: "🏷️" },
    { key: "description", label: t('dashboard.chat.progress.fields.description'), icon: "📝" },
    { key: "address", label: t('dashboard.chat.progress.fields.address'), icon: "📍" },
    { key: "phone", label: t('dashboard.chat.progress.fields.phone'), icon: "📞" },
    { key: "email", label: t('dashboard.chat.progress.fields.email'), icon: "📧" },
    { key: "website", label: t('dashboard.chat.progress.fields.website'), icon: "🌐" },
    { key: "hours", label: t('dashboard.chat.progress.fields.hours'), icon: "⏰" },
    { key: "services", label: t('dashboard.chat.progress.fields.services'), icon: "⚙️" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('dashboard.chat.summary.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = businessData[field.key as keyof BusinessData]
            if (!value) return null

            return (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{field.icon}</span>
                  <span className="font-medium text-gray-700">{field.label}</span>
                </div>
                <div className="ml-7 text-gray-900">
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {value.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  ) : typeof value === 'object' ? (
                    // Gestion spéciale pour les objets (comme hours)
                    <div className="space-y-1">
                      {Object.entries(value).map(([key, val]) => (
                        <div key={key} className="text-sm flex justify-between">
                          <span className="font-medium capitalize">{key}:</span>
                          <span>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{String(value)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-lg">💡</span>
            <div>
              <h4 className="font-medium text-blue-900">{t('dashboard.chat.summary.nextSteps.title')}</h4>
              <p className="text-sm text-blue-700 mt-1">
                {t('dashboard.chat.summary.nextSteps.description')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 