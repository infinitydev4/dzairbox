"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Upload, X, Image as ImageIcon, Loader2, CloudUpload } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  placeholder?: string
  aspectRatio?: "square" | "video" | "auto"
  compact?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className = "",
  placeholder = "Cliquez pour uploader une image",
  aspectRatio = "video",
  compact = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description: "Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.",
        variant: "destructive"
      })
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Fichier trop volumineux. Maximum 5MB.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      console.log("🔍 Réponse de l'API upload:", result)

      if (response.ok) {
        console.log("✅ Upload réussi, appel de onChange avec URL:", result.url)
        onChange(result.url)
        toast({
          title: "Succès",
          description: "Image uploadée avec succès !",
        })
      } else {
        throw new Error(result.error || "Erreur lors de l'upload")
      }
    } catch (error) {
      console.error("Erreur upload:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'upload",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "video":
        return "aspect-video"
      default:
        return "min-h-[200px]"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div className={`relative ${getAspectClass()} w-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg`}>
            <img
              src={value}
              alt="Image uploadée"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              onClick={() => onChange("")}
              variant="destructive"
              size="sm"
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`
            relative ${getAspectClass()} w-full cursor-pointer overflow-hidden rounded-2xl border-3 border-dashed 
            transition-all duration-300 ease-in-out border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 
            hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-lg
            ${disabled || isUploading ? "cursor-not-allowed opacity-50" : ""}
          `}
        >
          <div className="flex h-full flex-col items-center justify-center space-y-6 p-8 text-center">
            {isUploading ? (
              <>
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Upload en cours...</p>
                  <p className="text-sm text-gray-500">Veuillez patienter</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <p className="text-lg font-medium text-gray-900">{placeholder}</p>
                  <p className="text-sm text-gray-500">Glissez-déposez ou cliquez pour sélectionner</p>
                  <p className="text-xs text-gray-400">JPG, PNG ou WebP • Maximum 5MB</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={disabled || isUploading}
                  className="pointer-events-none border-2 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Choisir une image
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
