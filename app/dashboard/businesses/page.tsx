"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Building2, Clock, CheckCircle, ExternalLink, Loader2, Search, Filter, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getBusinessUrl, isDevelopment } from "@/lib/business-url"
import Link from "next/link"

interface Business {
  id: string
  name: string
  category: string
  description: string
  address: string
  phone: string
  email?: string
  website?: string
  hours: string
  services?: string
  subdomain: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BusinessesPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Helper function for interpolation
  const interpolate = (template: string, values: Record<string, any>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key].toString() : match
    })
  }

  useEffect(() => {
    if (session) {
      fetchBusinesses()
    }
  }, [session])

  // Filter and search logic
  useEffect(() => {
    let filtered = businesses

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(business => 
        business.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(business => {
        if (selectedStatus === "active") return business.isActive
        if (selectedStatus === "pending") return !business.isActive
        return true
      })
    }

    setFilteredBusinesses(filtered)
  }, [businesses, searchQuery, selectedCategory, selectedStatus])

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(businesses.map(b => b.category)))

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/businesses")
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

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('dashboard.businesses.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-gray-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 rounded-xl border-gray-200/50 bg-white/70 backdrop-blur-sm hover:bg-gray-50/80 px-4 py-3 ${
              showFilters ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard.businesses.filters.button')}</span>
          </Button>

          {/* New Business Button */}
          <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl px-6 py-3">
            <Link href="/dashboard/create-business" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.businesses.newBusiness')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5 rounded-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.businesses.filters.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                >
                  <option value="all">{t('dashboard.businesses.filters.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.businesses.filters.status')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                >
                  <option value="all">{t('dashboard.businesses.filters.allStatuses')}</option>
                  <option value="active">{t('dashboard.businesses.status.active')}</option>
                  <option value="pending">{t('dashboard.businesses.status.pending')}</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedStatus("all")
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 rounded-lg"
                >
                  {t('dashboard.businesses.filters.clear')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!isLoading && businesses.length > 0 && (
        <div className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50">
          {filteredBusinesses.length === businesses.length ? (
            <span>{interpolate(t('dashboard.businesses.results.total'), { count: businesses.length })}</span>
          ) : (
            <span>{interpolate(t('dashboard.businesses.results.filtered'), { 
              filtered: filteredBusinesses.length, 
              total: businesses.length 
            })}</span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      ) : businesses.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {t('dashboard.businesses.noBusinesses.title')}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('dashboard.businesses.noBusinesses.subtitle')}
            </p>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl">
              <Link href="/dashboard/create-business">
                {t('dashboard.businesses.noBusinesses.button')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredBusinesses.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {t('dashboard.businesses.noResults.title')}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('dashboard.businesses.noResults.subtitle')}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedStatus("all")
              }}
              variant="outline"
              className="rounded-xl"
            >
              {t('dashboard.businesses.filters.clear')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Businesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1">{business.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {business.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      {business.isActive ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {business.description}
                  </p>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700 min-w-[60px]">{t('dashboard.businesses.address')}</span>
                      <span className="text-gray-600 truncate">{business.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700 min-w-[60px]">{t('dashboard.businesses.phone')}</span>
                      <span className="text-gray-600">{business.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700 min-w-[60px]">{t('dashboard.businesses.hours')}</span>
                      <span className="text-gray-600 truncate">{business.hours}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-gray-500">
                        {t('dashboard.businesses.status.label')}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        business.isActive 
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800" 
                          : "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800"
                      }`}>
                        {business.isActive ? t('dashboard.businesses.status.active') : t('dashboard.businesses.status.pending')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {business.isActive && (
                        <Button asChild variant="outline" size="sm" className="w-full hover:bg-emerald-50 border-emerald-200 rounded-xl">
                          <Link 
                            href={getBusinessUrl(business.subdomain)}
                            target={!isDevelopment() ? "_blank" : "_self"}
                            className="flex items-center space-x-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>{t('dashboard.businesses.viewPage')}</span>
                          </Link>
                        </Button>
                      )}
                      
                      <div className="text-xs text-gray-500 text-center py-2 bg-gray-50/50 rounded-lg">
                        {t('common.url')}: {isDevelopment() 
                          ? `localhost:3000/${business.subdomain}` 
                          : `${business.subdomain}.dzbusiness.dz`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/50 backdrop-blur-sm border border-emerald-200/50 shadow-lg shadow-emerald-900/5">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center space-x-2">
                <span>💡</span>
                <span>{t('dashboard.businesses.tips.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-emerald-700">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t('dashboard.businesses.tips.tip1')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t('dashboard.businesses.tips.tip2')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t('dashboard.businesses.tips.tip3')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t('dashboard.businesses.tips.tip4')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 