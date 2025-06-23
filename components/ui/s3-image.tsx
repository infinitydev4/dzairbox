'use client'

import { useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'

interface S3ImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (e: any) => void
}

export function S3Image({ src, alt, className, onLoad, onError }: S3ImageProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)
    
    if (!src || typeof src !== 'string') {
      console.warn('⚠️ URL source invalide:', src)
      setHasError(true)
      setIsLoading(false)
      return
    }

    console.log('🔍 S3Image: Chargement de l\'image:', src)

    // Si l'URL n'est pas une URL S3, l'utiliser directement
    if (!src.includes('s3.') && !src.includes('amazonaws.com')) {
      console.log('📷 URL non-S3, utilisation directe:', src)
      setCurrentUrl(src)
      setIsLoading(false)
      return
    }

    // Pour les URLs S3, utiliser la route proxy
    console.log('📷 URL S3 détectée, utilisation du proxy')
    const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(src)}`
    setCurrentUrl(proxyUrl)
    setIsLoading(false)
  }, [src])

  const handleLoad = () => {
    console.log('✅ Image chargée avec succès via proxy:', src)
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = (e: any) => {
    console.error('❌ Erreur chargement image via proxy:', src)
    console.error('❌ URL proxy utilisée:', currentUrl)
    setIsLoading(false)
    setHasError(true)
    onError?.(e)
  }

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-400">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">Erreur de chargement</p>
          <p className="text-xs text-red-500 mt-1">URL: {src?.substring(0, 30)}...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={currentUrl}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  )
} 