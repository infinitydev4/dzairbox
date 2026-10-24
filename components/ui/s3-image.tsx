'use client'

import { useState, type SyntheticEvent } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface S3ImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void
}

function resolveImageUrl(src: string) {
  if (!src || typeof src !== "string") return ""
  if (!src.includes("s3.") && !src.includes("amazonaws.com")) return src
  return `/api/images/proxy?url=${encodeURIComponent(src)}`
}

export function S3Image({ src, alt, className, onLoad, onError }: S3ImageProps) {
  const currentUrl = resolveImageUrl(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const hasError = !currentUrl || failedSrc === src
  const isLoading = !hasError && loadedSrc !== src

  const handleLoad = () => {
    setLoadedSrc(src)
    setFailedSrc(null)
    onLoad?.()
  }

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    console.error("Erreur chargement image via proxy:", src, currentUrl)
    setFailedSrc(src)
    onError?.(event)
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
      <Image
        src={currentUrl}
        alt={alt}
        fill
        unoptimized
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  )
} 