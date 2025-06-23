"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getBusinessUrl } from '@/lib/business-url'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink,
  Navigation,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  category: string
  description: string | null
  address: string
  phone: string | null
  email: string | null
  website: string | null
  subdomain: string
}

interface BusinessMapProps {
  businesses: Business[]
  selectedBusiness?: Business | null
  onBusinessSelect?: (business: Business | null) => void
}

export function BusinessMap({ businesses, selectedBusiness, onBusinessSelect }: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Coordonnées par défaut pour l'Algérie (Alger)
  const defaultCenter = { lat: 36.7538, lng: 3.0588 }

  useEffect(() => {
    initializeMap()
    getUserLocation()
  }, [])

  useEffect(() => {
    if (map && businesses.length > 0) {
      updateMarkers()
    }
  }, [map, businesses])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      await loader.load()

      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 10,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        setMap(mapInstance)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error)
      setError('Erreur lors du chargement de la carte')
      setIsLoading(false)
    }
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: address + ', Algérie' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          resolve({ lat: location.lat(), lng: location.lng() })
        } else {
          // Fallback: essayer sans "Algérie"
          geocoder.geocode({ address: address }, (results2, status2) => {
            if (status2 === 'OK' && results2 && results2[0]) {
              const location = results2[0].geometry.location
              resolve({ lat: location.lat(), lng: location.lng() })
            } else {
              resolve(null)
            }
          })
        }
      })
    })
  }

  const updateMarkers = async () => {
    // Supprimer les anciens marqueurs
    markers.forEach(marker => marker.setMap(null))
    
    const newMarkers: google.maps.Marker[] = []
    const bounds = new google.maps.LatLngBounds()

    for (const business of businesses) {
      try {
        const position = await geocodeAddress(business.address)
        
        if (position && map) {
          const marker = new google.maps.Marker({
            position,
            map,
            title: business.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#059669" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="16" cy="16" r="4" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16)
            }
          })

          // InfoWindow pour chaque marqueur
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-gray-900 mb-2">${business.name}</h3>
                <p class="text-xs text-emerald-600 mb-2">${business.category}</p>
                <p class="text-sm text-gray-600 mb-2">${business.address}</p>
                ${business.description ? `<p class="text-xs text-gray-500 mb-2">${business.description.substring(0, 100)}...</p>` : ''}
                <button onclick="window.open('${getBusinessUrl(business.subdomain)}', '_blank')" 
                        class="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">
                  Voir la page
                </button>
              </div>
            `
          })

          marker.addListener('click', () => {
            // Fermer toutes les autres InfoWindows
            markers.forEach(m => {
              const iw = (m as any).infoWindow
              if (iw) iw.close()
            })
            
            infoWindow.open(map, marker)
            onBusinessSelect?.(business)
          })

          // Stocker l'InfoWindow dans le marqueur
          ;(marker as any).infoWindow = infoWindow

          newMarkers.push(marker)
          bounds.extend(position)
        }
      } catch (error) {
        console.error('Error geocoding address:', business.address, error)
      }
    }

    setMarkers(newMarkers)

    // Ajuster la vue pour inclure tous les marqueurs
    if (newMarkers.length > 0 && map) {
      if (newMarkers.length === 1) {
        map.setCenter(bounds.getCenter())
        map.setZoom(15)
      } else {
        map.fitBounds(bounds)
        map.setZoom(Math.min(map.getZoom() || 10, 12))
      }
    }
  }

  const centerOnUserLocation = () => {
    if (userLocation && map) {
      map.setCenter(userLocation)
      map.setZoom(12)
    } else {
      getUserLocation()
    }
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Carte indisponible</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}
      
      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={centerOnUserLocation}
          className="bg-white shadow-lg border-gray-200"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Carte */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Panneau d'information pour l'entreprise sélectionnée */}
      {selectedBusiness && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 bg-white shadow-xl z-10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {selectedBusiness.name}
                </h3>
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 mt-1">
                  {selectedBusiness.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBusinessSelect?.(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                <span className="line-clamp-1">{selectedBusiness.address}</span>
              </div>
              
              {selectedBusiness.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span>{selectedBusiness.phone}</span>
                </div>
              )}
            </div>

            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href={getBusinessUrl(selectedBusiness.subdomain)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir la page
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}