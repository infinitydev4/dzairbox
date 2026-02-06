"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Palette, Layout } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"

interface CustomPageBannerProps {
  businessId: string
  useCustomPage: boolean
  onActivated: () => void
}

export function CustomPageBanner({ businessId, useCustomPage, onActivated }: CustomPageBannerProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isActivating, setIsActivating] = useState(false)

  // Don't show if already activated
  if (useCustomPage) return null

  const handleActivate = async () => {
    setIsActivating(true)
    
    try {
      const response = await fetch(`/api/businesses/${businessId}/toggle-custom-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: true,
          templateKey: 'sidebar-right' // Default template
        })
      })

      if (!response.ok) {
        throw new Error('Failed to activate')
      }

      toast({
        title: t('dashboard.builder.saveSuccess'),
        description: t('dashboard.builder.banner.description')
      })

      // Notify parent to refresh or redirect
      onActivated()

    } catch (error) {
      console.error('Error activating custom page:', error)
      toast({
        title: t('dashboard.builder.banner.error'),
        description: t('dashboard.builder.banner.errorMessage'),
        variant: "destructive"
      })
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-pink-200 shadow-lg mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
              <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t('dashboard.builder.banner.title')}
              </CardTitle>
            </div>
            <CardDescription className="text-gray-700">
              {t('dashboard.builder.banner.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Layout className="h-4 w-4 text-purple-600" />
              <span>{t('dashboard.builder.banner.templates')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Palette className="h-4 w-4 text-pink-600" />
              <span>{t('dashboard.builder.banner.customization')}</span>
            </div>
          </div>
          
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            {isActivating ? (
              <>
                <span className="animate-pulse">{t('dashboard.builder.banner.activating')}</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('dashboard.builder.banner.activate')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

