"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle } from "lucide-react"
import { BusinessData } from "./chat-interface"

interface ChatProgressProps {
  progress: number
  businessData: BusinessData
}

export function ChatProgress({ progress, businessData }: ChatProgressProps) {
  const fields = [
    { key: "name", label: "Nom", icon: "🏢" },
    { key: "category", label: "Activité", icon: "🏷️" },
    { key: "description", label: "Description", icon: "📝" },
    { key: "address", label: "Adresse", icon: "📍" },
    { key: "phone", label: "Téléphone", icon: "📞" },
    { key: "hours", label: "Horaires", icon: "⏰" },
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
          <span className="text-emerald-900">Progression</span>
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
          <p className="text-xs text-emerald-700 font-medium mb-2">Optionnel :</p>
          <div className="space-y-1">
            {[
              { key: "email", label: "Email", icon: "📧" },
              { key: "website", label: "Site web", icon: "🌐" },
              { key: "services", label: "Services", icon: "⚙️" },
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
              {progress < 50 ? "🚀 Excellent début !" : 
               progress < 80 ? "⭐ Vous y êtes presque !" : 
               "🎉 Dernière ligne droite !"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 