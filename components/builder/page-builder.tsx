"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateSelector } from "./template-selector"
import { ThemeEditor } from "./theme-editor"
import { SectionEditor } from "./section-editor"
import { ImageEditor } from "./image-editor"
import { PreviewPane } from "./preview-pane"
import { BusinessPageConfigData } from "@/types/template"
import { getDefaultConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, Check } from "lucide-react"

interface PageBuilderProps {
  businessId: string
  currentConfig: BusinessPageConfigData | null
  businessImages?: string[]
  heroImage?: string
  onSaved: () => void
}

export function PageBuilder({ businessId, currentConfig, businessImages = [], heroImage, onSaved }: PageBuilderProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [config, setConfig] = useState<BusinessPageConfigData>(
    currentConfig || getDefaultConfig("sidebar-right")
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("template")
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  const handleSave = async (publish: boolean) => {
    setIsSaving(true)

    try {
      console.log('📤 Envoi de la config:', JSON.stringify(config, null, 2))
      console.log('📤 Publish:', publish)
      
      const response = await fetch(`/api/businesses/${businessId}/page-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, publish })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Erreur serveur:', error)
        console.error('❌ Détails:', JSON.stringify(error.details, null, 2))
        
        // Afficher les détails de validation dans le toast
        const errorMessage = error.details 
          ? `Configuration invalide: ${JSON.stringify(error.details)}`
          : error.error || 'Failed to save'
          
        toast({
          title: "Erreur de validation",
          description: errorMessage,
          variant: "destructive"
        })
        
        throw new Error(error.error || 'Failed to save')
      }

      toast({
        title: publish ? t('dashboard.builder.publishSuccess') : t('dashboard.builder.saveSuccess'),
        description: publish 
          ? "Votre page est maintenant visible publiquement" 
          : "Votre brouillon a été sauvegardé"
      })

      setIsDirty(false)
      setJustSaved(true)
      
      // Animation de feedback
      setTimeout(() => setJustSaved(false), 3000)
      
      onSaved()

    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfigChange = (newConfig: BusinessPageConfigData) => {
    setConfig(newConfig)
    setIsDirty(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Builder Controls */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.builder.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="template">{t('dashboard.builder.selectTemplate')}</TabsTrigger>
                <TabsTrigger value="theme">{t('dashboard.builder.theme')}</TabsTrigger>
                <TabsTrigger value="sections">{t('dashboard.builder.sections')}</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-6">
                <TemplateSelector
                  selected={config.templateKey}
                  onChange={(templateKey) => {
                    const newConfig = getDefaultConfig(templateKey)
                    
                    // Préserver les données importantes lors du changement de template
                    newConfig.theme = config.theme
                    
                    // Préserver le hero (titre, description, image, type de fond, CTA)
                    newConfig.hero = {
                      ...newConfig.hero,
                      title: config.hero.title,
                      description: config.hero.description,
                      backgroundType: config.hero.backgroundType,
                      backgroundValue: config.hero.backgroundValue,
                      backgroundImage: config.hero.backgroundImage,
                      showCTA: config.hero.showCTA,
                    }
                    
                    // Préserver les sections
                    newConfig.sections = {
                      ...newConfig.sections,
                      services: {
                        ...newConfig.sections.services,
                        enabled: config.sections.services.enabled,
                        title: config.sections.services.title,
                      },
                      about: {
                        ...newConfig.sections.about,
                        enabled: config.sections.about.enabled,
                        content: config.sections.about.content,
                      },
                      gallery: {
                        enabled: config.sections.gallery?.enabled || false,
                        images: config.sections.gallery?.images || []
                      }
                    }
                    
                    // Pour les templates avec sidebar, préserver les préférences si elles existent
                    if (newConfig.sidebar && config.sidebar) {
                      newConfig.sidebar = {
                        ...newConfig.sidebar,
                        contact: config.sidebar.contact,
                        socials: config.sidebar.socials,
                        hours: config.sidebar.hours,
                        address: config.sidebar.address,
                      }
                    }
                    
                    handleConfigChange(newConfig)
                  }}
                />
              </TabsContent>

              <TabsContent value="theme" className="mt-6">
                <ThemeEditor
                  theme={config.theme}
                  onChange={(theme) => handleConfigChange({ ...config, theme })}
                />
              </TabsContent>

              <TabsContent value="sections" className="mt-6">
                <SectionEditor
                  config={config}
                  onChange={handleConfigChange}
                />
              </TabsContent>

              <TabsContent value="images" className="mt-6">
                <ImageEditor
                  config={config}
                  businessImages={businessImages}
                  heroImage={heroImage}
                  onChange={handleConfigChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => handleSave(false)}
            disabled={!isDirty || isSaving}
            variant="outline"
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('dashboard.builder.publishing')}
              </>
            ) : justSaved ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('dashboard.builder.saveDraft')}
              </>
            )}
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={!isDirty || isSaving}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('dashboard.builder.publishing')}
              </>
            ) : justSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Publié !
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                {t('dashboard.builder.publish')}
              </>
            )}
          </Button>
        </div>

        {isDirty && !justSaved && (
          <p className="text-sm text-orange-600 text-center">
            ⚠️ Vous avez des modifications non sauvegardées
          </p>
        )}
        
        {justSaved && (
          <p className="text-sm text-green-600 text-center animate-pulse">
            ✅ Modifications enregistrées avec succès
          </p>
        )}
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-1">
        <PreviewPane config={config} businessId={businessId} />
      </div>
    </div>
  )
}

