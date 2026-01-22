"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { useLanguage } from "@/components/language-provider"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GallerySectionProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function GallerySection({ business, config }: GallerySectionProps) {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!config.sections.gallery?.enabled) return null

  const images = config.sections.gallery.images || []

  if (images.length === 0) return null

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
  }

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % images.length
    setSelectedIndex(nextIndex)
    setSelectedImage(images[nextIndex])
  }

  const handlePrev = () => {
    const prevIndex = (selectedIndex - 1 + images.length) % images.length
    setSelectedIndex(prevIndex)
    setSelectedImage(images[prevIndex])
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <span className="mr-2" style={{ color: config.theme.primaryColor }}>📸</span>
            Galerie photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => handleImageClick(image, index)}
              >
                <img
                  src={image}
                  alt={`${business.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    console.error("Erreur chargement image galerie:", image)
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>

          <div
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt={`${business.name} - Photo ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                console.error("Erreur chargement image lightbox:", selectedImage)
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
        </div>
      )}
    </>
  )
}

