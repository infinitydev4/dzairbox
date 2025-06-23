"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle } from "lucide-react"
import { BusinessData } from "./chat-interface"
import { useLanguage } from "@/components/language-provider"

interface ChatProgressProps {
  progress: number
  businessData: BusinessData
}

export function ChatProgress({ progress, businessData }: ChatProgressProps) {
  const { t } = useLanguage()
  
  const fields = [
    { key: "name", label: t('dashboard.chat.progress.fields.name'), icon: "🏢" },
    { key: "category", label: t('dashboard.chat.progress.fields.category'), icon: "🏷️" },
    { key: "description", label: t('dashboard.chat.progress.fields.description'), icon: "📝" },
    { key: "address", label: t('dashboard.chat.progress.fields.address'), icon: "📍" },
    { key: "phone", label: t('dashboard.chat.progress.fields.phone'), icon: "📞" },
    { key: "hours", label: t('dashboard.chat.progress.fields.hours'), icon: "⏰" },
  ]

  const isFieldCompleted = (field: string) => {
    const value = businessData[field as keyof BusinessData]
    if (!value) return false
    
    // Gestion spéciale pour les objets (comme hours)
    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }
    
    // Pour les strings
    return String(value).trim() !== ""
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="text-emerald-900">{t('dashboard.chat.progress.title')}</span>
          <span className="text-emerald-600 font-bold text-lg">{Math.round(progress)}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Barre de progrès */}
        <div className="w-full bg-emerald-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Liste des champs obligatoires */}
        <div className="space-y-2">
          {fields.map((field) => {
            const isCompleted = isFieldCompleted(field.key)
            return (
              <div key={field.key} className="flex items-center space-x-2">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                )}
                <span className="text-xs flex items-center space-x-1 flex-1 min-w-0">
                  <span className="flex-shrink-0">{field.icon}</span>
                  <span className={`truncate ${isCompleted ? "text-emerald-800 font-medium" : "text-emerald-600"}`}>
                    {field.label}
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        {/* Champs optionnels */}
        <div className="pt-2 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 font-medium mb-2">{t('dashboard.chat.progress.optional')}</p>
          <div className="space-y-1">
            {[
              { key: "email", label: t('dashboard.chat.progress.fields.email'), icon: "📧" },
              { key: "website", label: t('dashboard.chat.progress.fields.website'), icon: "🌐" },
              { key: "services", label: t('dashboard.chat.progress.fields.services'), icon: "⚙️" },
            ].map((field) => {
              const isCompleted = isFieldCompleted(field.key)
              return (
                <div key={field.key} className="flex items-center space-x-2">
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                  )}
                  <span className="text-xs flex items-center space-x-1 flex-1 min-w-0">
                    <span className="flex-shrink-0">{field.icon}</span>
                    <span className={`truncate ${isCompleted ? "text-emerald-700" : "text-emerald-500"}`}>
                      {field.label}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivation */}
        {progress > 0 && progress < 100 && (
          <div className="mt-3 p-2 bg-emerald-100 rounded-lg">
            <p className="text-xs text-emerald-800 text-center font-medium">
              {progress < 50 ? t('dashboard.chat.progress.motivation.start') : 
               progress < 80 ? t('dashboard.chat.progress.motivation.middle') : 
               t('dashboard.chat.progress.motivation.end')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 