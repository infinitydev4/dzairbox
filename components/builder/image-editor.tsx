"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BusinessPageConfigData } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { ImageUpload } from "@/components/ui/image-upload"
import { X, Plus, Image as ImageIcon } from "lucide-react"

interface ImageEditorProps {
  config: BusinessPageConfigData
  businessImages: string[] // Images de l'entreprise
  heroImage?: string // Image hero de l'entreprise
  onChange: (config: BusinessPageConfigData) => void
}

export function ImageEditor({ config, businessImages, heroImage, onChange }: ImageEditorProps) {
  const { t } = useLanguage()
  const [tempGalleryImage, setTempGalleryImage] = useState("")

  const handleHeroImageChange = (imageUrl: string) => {
    if (!imageUrl) {
      // Si l'URL est vide, on supprime l'image
      onChange({
        ...config,
        hero: {
          ...config.hero,
          backgroundImage: undefined,
          backgroundType: "gradient"
        }
      })
    } else {
      onChange({
        ...config,
        hero: {
          ...config.hero,
          backgroundImage: imageUrl,
          backgroundType: "image"
        }
      })
    }
  }

  const handleUseBusinessHeroImage = () => {
    if (heroImage) {
      handleHeroImageChange(heroImage)
    }
  }

  const handleGalleryImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      console.log("✅ Image ajoutée à la galerie:", imageUrl)
      const currentImages = config.sections.gallery?.images || []
      onChange({
        ...config,
        sections: {
          ...config.sections,
          gallery: {
            enabled: true,
            images: [...currentImages, imageUrl]
          }
        }
      })
      // Reset le champ temporaire
      setTempGalleryImage("")
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    const currentImages = config.sections.gallery?.images || []
    onChange({
      ...config,
      sections: {
        ...config.sections,
        gallery: {
          ...config.sections.gallery,
          enabled: config.sections.gallery?.enabled || false,
          images: currentImages.filter((_, i) => i !== index)
        }
      }
    })
  }

  const handleUseBusinessImages = () => {
    onChange({
      ...config,
      sections: {
        ...config.sections,
        gallery: {
          enabled: true,
          images: businessImages
        }
      }
    })
  }

  const galleryImages = config.sections.gallery?.images || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('dashboard.builder.imageEditor.title')}</h3>
        <p className="text-sm text-gray-600">{t('dashboard.builder.imageEditor.subtitle')}</p>
      </div>

      {/* Hero Image */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-base font-medium">{t('dashboard.builder.imageEditor.heroImage')}</Label>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.builder.imageEditor.heroImageDesc')}</p>
          </div>

          <ImageUpload
            value={config.hero.backgroundImage}
            onChange={handleHeroImageChange}
            placeholder={t('dashboard.builder.imageEditor.heroImagePlaceholder')}
            aspectRatio="video"
          />

          {!config.hero.backgroundImage && heroImage && (
            <Button
              onClick={handleUseBusinessHeroImage}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {t('dashboard.builder.imageEditor.useBusinessHero')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">{t('dashboard.builder.imageEditor.gallery')}</Label>
              <p className="text-sm text-gray-500 mt-1">
                {galleryImages.length} {t('dashboard.builder.imageEditor.galleryCount')}
              </p>
            </div>
            {businessImages.length > 0 && (
              <Button
                onClick={handleUseBusinessImages}
                variant="outline"
                size="sm"
              >
                {t('dashboard.builder.imageEditor.useBusinessImages')} ({businessImages.length})
              </Button>
            )}
          </div>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      console.error("Erreur chargement image:", image)
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E❌%3C/text%3E%3C/svg%3E"
                    }}
                  />
                  <Button
                    onClick={() => handleRemoveGalleryImage(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <ImageUpload
              value={tempGalleryImage}
              onChange={handleGalleryImageUpload}
              placeholder={t('dashboard.builder.imageEditor.addToGallery')}
              aspectRatio="square"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

