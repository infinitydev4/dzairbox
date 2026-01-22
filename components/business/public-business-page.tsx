"use client"

import { useState, useEffect } from "react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { TemplateRenderer } from "@/components/templates/template-renderer"
import { BusinessPage } from "@/components/business/business-page"
import { LivePageEditor } from "@/components/builder/live-page-editor"
import { Button } from "@/components/ui/button"
import { Edit3, Loader2 } from "lucide-react"

interface PublicBusinessPageProps {
  business: BusinessWithConfig
  useCustomPage: boolean
  config?: BusinessPageConfigData
}

export function PublicBusinessPage({ business, useCustomPage, config }: PublicBusinessPageProps) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true)

  useEffect(() => {
    checkOwnership()
  }, [business.id])

  const checkOwnership = async () => {
    try {
      const response = await fetch(`/api/businesses/${business.id}/is-owner`)
      const data = await response.json()
      setIsOwner(data.isOwner)
    } catch (error) {
      console.error("Erreur lors de la vérification de propriété:", error)
      setIsOwner(false)
    } finally {
      setIsCheckingOwnership(false)
    }
  }

  // Afficher l'éditeur en mode live
  if (isEditing && config) {
    return (
      <LivePageEditor
        business={business}
        initialConfig={config}
        onClose={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="relative">
      {/* Bannière de personnalisation pour le propriétaire */}
      {isOwner && !isCheckingOwnership && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="h-5 w-5" />
              <span className="font-medium">Vous êtes le propriétaire de cette page</span>
            </div>
            
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="bg-white text-emerald-600 hover:bg-gray-100 shadow-md"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Personnaliser cette page
            </Button>
          </div>
        </div>
      )}

      {/* Affichage de la page */}
      {useCustomPage && config ? (
        <TemplateRenderer business={business as any} config={config} />
      ) : (
        <BusinessPage business={business} />
      )}
    </div>
  )
}

