"use client"

import { useState, useEffect } from "react"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { getDefaultConfig } from "@/types/template"
import { TemplateRenderer } from "@/components/templates/template-renderer"
import { TemplateSelector } from "@/components/builder/template-selector"
import { ThemeEditor } from "@/components/builder/theme-editor"
import { SectionEditor } from "@/components/builder/section-editor"
import { ImageEditor } from "@/components/builder/image-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  Save, 
  Eye, 
  Loader2, 
  Edit3,
  Palette,
  Layout,
  Image as ImageIcon,
  Settings,
  Check,
  HelpCircle
} from "lucide-react"

interface LivePageEditorProps {
  business: BusinessWithConfig
  initialConfig: BusinessPageConfigData | null
  onClose: () => void
}

export function LivePageEditor({ business, initialConfig, onClose }: LivePageEditorProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<BusinessPageConfigData>(
    initialConfig || getDefaultConfig("sidebar-right")
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("template")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [justPublished, setJustPublished] = useState(false)

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    }
  }, [initialConfig])

  const handleConfigChange = (newConfig: BusinessPageConfigData) => {
    setConfig(newConfig)
    setIsDirty(true)
  }

  const handleSave = async (publish: boolean) => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/businesses/${business.id}/page-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, publish })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Échec de la sauvegarde')
      }

      setIsDirty(false)
      
      if (publish) {
        setJustPublished(true)
        
        toast({
          title: "✅ Configuration publiée",
          description: "Vos modifications sont maintenant visibles publiquement. Rechargement...",
        })
        
        // Recharger la page pour afficher la version publiée depuis le serveur
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          title: "💾 Brouillon sauvegardé",
          description: "Vos modifications ont été sauvegardées",
        })
      }
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la sauvegarde",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      {/* Bannière en haut */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Edit3 className="h-5 w-5" />
            <span className="font-semibold">Mode Personnalisation</span>
            {justPublished && (
              <span className="text-xs bg-green-400 text-green-900 px-3 py-1 rounded-full animate-pulse flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Publié avec succès !
              </span>
            )}
            {isDirty && !justPublished && (
              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                Modifications non sauvegardées
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowHelp(!showHelp)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleSave(false)}
              disabled={!isDirty || isSaving}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
            
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              size="sm"
              className="bg-white text-emerald-600 hover:bg-gray-100"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Publier
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message d'aide */}
      {showHelp && (
        <div className="absolute top-16 right-4 z-50 w-80">
          <Card className="shadow-2xl border-emerald-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">💡 Guide rapide</h3>
                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Choisissez un <strong>Template</strong> pour le layout de votre page</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Personnalisez les <strong>Couleurs</strong> et le style dans l'onglet Thème</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Activez/désactivez des <strong>Sections</strong> selon vos besoins</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Ajoutez vos <strong>Images</strong> pour le hero et la galerie</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span><strong>Sauvegardez</strong> pour garder un brouillon ou <strong>Publiez</strong> pour rendre visible</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex h-full pt-14">
        {/* Sidebar gauche */}
        <div 
          className={`bg-white shadow-2xl overflow-y-auto transition-all duration-300 ${
            isCollapsed ? 'w-0' : 'w-96'
          }`}
        >
          {!isCollapsed && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personnalisation</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Personnalisez votre page en temps réel
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 gap-1">
                  <TabsTrigger value="template" className="text-xs">
                    <Layout className="h-4 w-4 mr-1" />
                    Template
                  </TabsTrigger>
                  <TabsTrigger value="theme" className="text-xs">
                    <Palette className="h-4 w-4 mr-1" />
                    Thème
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="text-xs">
                    <Settings className="h-4 w-4 mr-1" />
                    Sections
                  </TabsTrigger>
                  <TabsTrigger value="images" className="text-xs">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Images
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="mt-4">
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

                <TabsContent value="theme" className="mt-4">
                  <ThemeEditor
                    theme={config.theme}
                    onChange={(theme) => handleConfigChange({ ...config, theme })}
                  />
                </TabsContent>

                <TabsContent value="sections" className="mt-4">
                  <SectionEditor
                    config={config}
                    onChange={handleConfigChange}
                  />
                </TabsContent>

                <TabsContent value="images" className="mt-4">
                  <ImageEditor
                    config={config}
                    businessImages={Array.isArray(business.images) ? business.images : []}
                    heroImage={business.heroImage || undefined}
                    onChange={handleConfigChange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Bouton pour collapse/expand la sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-emerald-700 transition-colors z-10"
          style={{ marginLeft: isCollapsed ? '0' : '384px' }}
        >
          {isCollapsed ? '→' : '←'}
        </button>

        {/* Aperçu en temps réel */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="min-h-full">
            <TemplateRenderer 
              business={business as any} 
              config={config} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

