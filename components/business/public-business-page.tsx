"use client"

import { trackEvent } from "@/lib/studio/events"
import { useState, useEffect } from "react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { TemplateRenderer } from "@/components/templates/template-renderer"
import { BusinessPage } from "@/components/business/business-page"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Edit3 } from "lucide-react"
interface PublicBusinessPageProps {
  business: BusinessWithConfig
  useCustomPage: boolean
  config?: BusinessPageConfigData
}

export function PublicBusinessPage({ business, useCustomPage, config }: PublicBusinessPageProps) {
  const { t } = useLanguage()
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true)

  useEffect(() => { trackEvent("view", business.id) }, [business.id])

  useEffect(() => {
    let cancelled = false

    async function checkOwnership() {
      try {
        const response = await fetch(`/api/businesses/${business.id}/is-owner`)
        const data = await response.json()
        if (!cancelled) setIsOwner(data.isOwner)
      } catch (error) {
        console.error("Erreur lors de la vérification de propriété:", error)
        if (!cancelled) setIsOwner(false)
      } finally {
        if (!cancelled) setIsCheckingOwnership(false)
      }
    }

    void checkOwnership()
    return () => {
      cancelled = true
    }
  }, [business.id])


  return (
    <div className="relative">
      {/* Bannière de personnalisation pour le propriétaire */}
      {isOwner && !isCheckingOwnership && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="h-5 w-5" />
              <span className="font-medium">{t('dashboard.builder.ownerBanner.title')}</span>
            </div>
            
            <Button asChild
              size="sm"
              className="bg-white text-emerald-600 hover:bg-gray-100 shadow-md"
            >
              <Link href={`/dashboard/businesses/${business.id}/studio`}><Edit3 className="mr-2 h-4 w-4" />{t('studio.openStudio')}</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Affichage de la page */}
      {useCustomPage && config ? (
        <TemplateRenderer business={business} config={config} />
      ) : (
        <BusinessPage business={business} />
      )}
    </div>
  )
}

