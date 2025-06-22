"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessData } from "./chat-interface"

interface DebugPanelProps {
  businessData: BusinessData
  progress: number
}

export function DebugPanel({ businessData, progress }: DebugPanelProps) {
  // N'afficher le debug qu'en mode développement
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
  const completedRequiredFields = requiredFields.filter(field => {
    const value = businessData[field as keyof BusinessData]
    if (!value) return false
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }
    
    return String(value).trim() !== ""
  })

  const optionalFields = ["email", "website", "services"]
  const completedOptionalFields = optionalFields.filter(field => {
    const value = businessData[field as keyof BusinessData]
    if (!value) return false
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }
    
    return String(value).trim() !== ""
  })

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">🐛 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <div className="font-medium text-yellow-900">Progrès: {progress}%</div>
          <div className="text-yellow-700">
            {completedRequiredFields.length}/{requiredFields.length} obligatoires
          </div>
          <div className="text-yellow-700">
            {completedOptionalFields.length}/{optionalFields.length} optionnels
          </div>
        </div>
        
        <div className="pt-2 border-t border-yellow-200">
          <div className="font-medium text-yellow-900 mb-1">Données:</div>
          <div className="bg-yellow-100 p-2 rounded text-[10px] font-mono max-h-32 overflow-y-auto">
            <pre>{JSON.stringify(businessData, null, 2)}</pre>
          </div>
        </div>

        <div className="pt-2 border-t border-yellow-200">
          <div className="font-medium text-yellow-900 mb-1">État localStorage:</div>
          <div className="text-yellow-700">
            {typeof window !== 'undefined' && localStorage.getItem('pendingBusinessData') 
              ? "✅ Données sauvegardées" 
              : "❌ Aucune donnée sauvegardée"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 