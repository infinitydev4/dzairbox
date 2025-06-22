"use client"

import { useState, useEffect } from "react"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { getBusinessUrl } from "@/lib/business-url"
import { useLanguage } from "@/components/language-provider"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Search,
  Building2,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

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

export default function BusinessesPage() {
  const { t } = useLanguage()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/businesses-public')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error("Error fetching businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              {t('common.loading')}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('directory.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('directory.subtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={t('directory.search')}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{businesses.length}</div>
                <div className="text-gray-600">{t('directory.stats.activeBusinesses')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(businesses.map(b => b.address.split(',')[0])).size}
                </div>
                <div className="text-gray-600">{t('directory.stats.citiesCovered')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Badge className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(businesses.map(b => b.category)).size}
                </div>
                <div className="text-gray-600">{t('directory.stats.categories')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Businesses Grid */}
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('directory.empty.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('directory.empty.subtitle')}
                </p>
                <Button asChild>
                  <Link href="/register">
                    {t('directory.empty.button')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {business.name}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="text-xs">
                        {business.category}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {business.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="line-clamp-1">{business.address}</span>
                      </div>
                      
                      {business.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      
                      {business.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="line-clamp-1">{business.email}</span>
                        </div>
                      )}
                      
                      {business.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="line-clamp-1">{business.website}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <Button asChild className="w-full">
                        <Link href={getBusinessUrl(business.subdomain)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('directory.viewPage')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('directory.cta.title')}
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {t('directory.cta.subtitle')}
              </p>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/register">
                  {t('directory.cta.button')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 