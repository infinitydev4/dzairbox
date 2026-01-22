"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BusinessPageConfigData } from "@/types/template"
import { useLanguage } from "@/components/language-provider"

interface ThemeEditorProps {
  theme: BusinessPageConfigData['theme']
  onChange: (theme: BusinessPageConfigData['theme']) => void
}

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  const { t } = useLanguage()

  const handleColorChange = (field: keyof BusinessPageConfigData['theme'], value: string) => {
    onChange({
      ...theme,
      [field]: value
    })
  }

  const handleGradientChange = (from: string, to: string) => {
    onChange({
      ...theme,
      gradient: { from, to }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('dashboard.builder.themeEditor.title')}</h3>
        <p className="text-sm text-gray-600">Personnalisez les couleurs de votre page</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">{t('dashboard.builder.themeEditor.primaryColor')}</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="primaryColor"
              type="color"
              value={theme.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="w-16 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              placeholder="#10b981"
              className="flex-1"
            />
          </div>
          <div 
            className="h-8 rounded-md border" 
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">{t('dashboard.builder.themeEditor.secondaryColor')}</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="secondaryColor"
              type="color"
              value={theme.secondaryColor}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              className="w-16 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={theme.secondaryColor}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              placeholder="#059669"
              className="flex-1"
            />
          </div>
          <div 
            className="h-8 rounded-md border" 
            style={{ backgroundColor: theme.secondaryColor }}
          />
        </div>

        {theme.gradient && (
          <div className="space-y-2">
            <Label>{t('dashboard.builder.themeEditor.gradient')}</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="gradientFrom" className="text-xs">De</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="gradientFrom"
                    type="color"
                    value={theme.gradient.from}
                    onChange={(e) => handleGradientChange(e.target.value, theme.gradient!.to)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.gradient.from}
                    onChange={(e) => handleGradientChange(e.target.value, theme.gradient!.to)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gradientTo" className="text-xs">À</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="gradientTo"
                    type="color"
                    value={theme.gradient.to}
                    onChange={(e) => handleGradientChange(theme.gradient!.from, e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.gradient.to}
                    onChange={(e) => handleGradientChange(theme.gradient!.from, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div 
                className="h-16 rounded-md border" 
                style={{ 
                  background: `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.to})` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

