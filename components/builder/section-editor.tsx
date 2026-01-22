"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BusinessPageConfigData } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"

interface SectionEditorProps {
  config: BusinessPageConfigData
  onChange: (config: BusinessPageConfigData) => void
}

export function SectionEditor({ config, onChange }: SectionEditorProps) {
  const { t } = useLanguage()

  const handleToggle = (section: 'services' | 'about' | 'gallery', enabled: boolean) => {
    onChange({
      ...config,
      sections: {
        ...config.sections,
        [section]: {
          ...config.sections[section],
          enabled
        }
      }
    })
  }

  const handleDisplayMode = (mode: 'grid' | 'list') => {
    onChange({
      ...config,
      sections: {
        ...config.sections,
        services: {
          ...config.sections.services,
          display: mode
        }
      }
    })
  }

  const handleSidebarToggle = (field: string, enabled: boolean) => {
    if (!config.sidebar) return
    
    const keys = field.split('.')
    if (keys.length === 1) {
      onChange({
        ...config,
        sidebar: {
          ...config.sidebar,
          [keys[0]]: { enabled }
        }
      })
    } else {
      const sidebarKey = keys[0] as keyof typeof config.sidebar
      const sidebarValue = config.sidebar[sidebarKey]
      
      onChange({
        ...config,
        sidebar: {
          ...config.sidebar,
          [keys[0]]: {
            ...(typeof sidebarValue === 'object' ? sidebarValue : {}),
            [keys[1]]: enabled
          }
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('dashboard.builder.sectionEditor.title')}</h3>
        <p className="text-sm text-gray-600">Activez ou désactivez les sections</p>
      </div>

      <div className="space-y-4">
        {/* Services Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="services-toggle" className="text-base font-medium">
                {t('dashboard.builder.sectionEditor.services')}
              </Label>
              <Switch
                id="services-toggle"
                checked={config.sections.services.enabled}
                onCheckedChange={(checked) => handleToggle('services', checked)}
              />
            </div>
            
            {config.sections.services.enabled && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <Label className="text-sm">{t('dashboard.builder.sectionEditor.displayMode')}</Label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDisplayMode('grid')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      config.sections.services.display === 'grid'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('dashboard.builder.sectionEditor.grid')}
                  </button>
                  <button
                    onClick={() => handleDisplayMode('list')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      config.sections.services.display === 'list'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('dashboard.builder.sectionEditor.list')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="about-toggle" className="text-base font-medium">
                {t('dashboard.builder.sectionEditor.about')}
              </Label>
              <Switch
                id="about-toggle"
                checked={config.sections.about.enabled}
                onCheckedChange={(checked) => handleToggle('about', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gallery-toggle" className="text-base font-medium">
                Galerie photo
              </Label>
              <Switch
                id="gallery-toggle"
                checked={config.sections.gallery?.enabled || false}
                onCheckedChange={(checked) => handleToggle('gallery', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Options (only for sidebar templates) */}
        {config.sidebar && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    {t('dashboard.builder.sectionEditor.contact')}
                  </Label>
                </div>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact-phone" className="text-sm">Téléphone</Label>
                    <Switch
                      id="contact-phone"
                      checked={config.sidebar.contact.phone}
                      onCheckedChange={(checked) => handleSidebarToggle('contact.phone', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact-email" className="text-sm">Email</Label>
                    <Switch
                      id="contact-email"
                      checked={config.sidebar.contact.email}
                      onCheckedChange={(checked) => handleSidebarToggle('contact.email', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hours-toggle" className="text-base font-medium">
                    {t('dashboard.builder.sectionEditor.hours')}
                  </Label>
                  <Switch
                    id="hours-toggle"
                    checked={config.sidebar.hours.enabled}
                    onCheckedChange={(checked) => handleSidebarToggle('hours.enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address-toggle" className="text-base font-medium">
                    {t('dashboard.builder.sectionEditor.address')}
                  </Label>
                  <Switch
                    id="address-toggle"
                    checked={config.sidebar.address.enabled}
                    onCheckedChange={(checked) => handleSidebarToggle('address.enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

