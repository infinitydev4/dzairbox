"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { getBusinessUrl } from "@/lib/business-url"
import { useLanguage } from "@/components/language-provider"
import { BusinessFiltersDrawer, BusinessFilters } from "@/components/business-filters-drawer"
import { BusinessMap } from "@/components/business-map"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Search,
  Building2,
  ExternalLink,
  Filter,
  Grid3X3,
  List,
  Map,
  Star,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  heroImage: string | null
  subdomain: string
}

type ViewMode = 'grid' | 'list' | 'map'

export default function BusinessesPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [showMobileStats, setShowMobileStats] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [filters, setFilters] = useState<BusinessFilters>({
    search: '',
    category: '',
    city: '',
    hasPhone: false,
    hasEmail: false,
    hasSocial: false,
    sortBy: 'name'
  })
  
  const createServiceUrl = session ? '/dashboard/create-business' : '/create-service'

  // Initialiser les filtres depuis l'URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlCategory = searchParams.get('category')
    
    if (urlSearch) {
      setSearchTerm(urlSearch)
      setFilters(prev => ({ ...prev, search: urlSearch }))
    }
    
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: urlCategory }))
    }
  }, [searchParams])

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

  // Filtrer et trier les entreprises
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses

    // Recherche textuelle
    const searchQuery = searchTerm || filters.search
    if (searchQuery) {
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (business.description && business.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(business => business.category === filters.category)
    }

    // Filtre par ville
    if (filters.city) {
      filtered = filtered.filter(business => 
        business.address.split(',')[0]?.trim() === filters.city
      )
    }

    // Filtres par informations disponibles
    if (filters.hasPhone) {
      filtered = filtered.filter(business => business.phone)
    }
    if (filters.hasEmail) {
      filtered = filtered.filter(business => business.email)
    }
    if (filters.hasSocial) {
      filtered = filtered.filter(business => 
        business.facebook || business.instagram || business.tiktok || business.youtube
      )
    }

    // Tri
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'category':
          return a.category.localeCompare(b.category)
        case 'newest':
          // Simuler un tri par date (en réalité, on pourrait trier par createdAt)
          return b.name.localeCompare(a.name)
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [businesses, searchTerm, filters])

  // Pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex)

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: BusinessFilters) => {
    setFilters(newFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.city) count++
    if (filters.hasPhone) count++
    if (filters.hasEmail) count++
    if (filters.hasSocial) count++
    if (filters.sortBy !== 'name') count++
    return count
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <Header />
        <main className="container py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Header />
      <main className="container py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header optimisé mobile */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-emerald-100 rounded-full mb-4 sm:mb-6">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('directory.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t('directory.subtitle')}
            </p>
          </div>

          {/* Barre de recherche responsive */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Recherche principale */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <Input
                      placeholder={t('directory.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Contrôles alignés */}
                  <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Bouton filtres */}
                      <Button
                        variant="outline"
                        onClick={() => setIsFiltersOpen(true)}
                        className="h-10 sm:h-12 px-3 sm:px-6 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-sm"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Filtres</span>
                        {getActiveFiltersCount() > 0 && (
                          <Badge className="ml-2 bg-emerald-600 text-white text-xs">
                            {getActiveFiltersCount()}
                          </Badge>
                        )}
                      </Button>

                      {/* Sélecteur de vue */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="h-8 sm:h-10 px-2 sm:px-3"
                        >
                          <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="h-8 sm:h-10 px-2 sm:px-3"
                        >
                          <List className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'map' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('map')}
                          className="h-8 sm:h-10 px-2 sm:px-3"
                        >
                          <Map className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Bouton statistiques étendu */}
                    <Button
                      variant="outline"
                      onClick={() => setShowMobileStats(!showMobileStats)}
                      className="lg:hidden flex-1 h-10 ml-2 border-gray-200 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span>Statistiques</span>
                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showMobileStats ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques responsive */}
          <div className={`mb-6 sm:mb-8 ${showMobileStats ? 'block' : 'hidden sm:block'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2 sm:mb-4">
                    <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">{filteredBusinesses.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Entreprises</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2 sm:mb-4">
                    <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {Array.from(new Set(filteredBusinesses.map(b => b.address.split(',')[0]))).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Villes</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2 sm:mb-4">
                    <Star className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {Array.from(new Set(filteredBusinesses.map(b => b.category))).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Catégories</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-2 sm:mb-4">
                    <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {filteredBusinesses.filter(b => b.facebook || b.instagram || b.tiktok || b.youtube).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Réseaux sociaux</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contenu principal selon le mode de vue */}
          {viewMode === 'map' ? (
            <div className="h-[500px] sm:h-[600px] lg:h-[700px] rounded-lg overflow-hidden shadow-lg">
              <BusinessMap 
                businesses={filteredBusinesses as any}
                selectedBusiness={selectedBusiness}
                onBusinessSelect={setSelectedBusiness as any}
              />
            </div>
          ) : (
            <>
              {/* Résultats grille/liste */}
              {filteredBusinesses.length === 0 ? (
                <Card className="shadow-lg border-0 bg-white">
                  <CardContent className="p-8 sm:p-16 text-center">
                    <div className="p-4 sm:p-6 bg-gray-100 rounded-full w-fit mx-auto mb-4 sm:mb-6">
                      <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      {searchTerm || getActiveFiltersCount() > 0 ? 'Aucun résultat trouvé' : t('directory.empty.title')}
                    </h3>
                    <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                      {searchTerm || getActiveFiltersCount() > 0 
                        ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
                        : t('directory.empty.subtitle')
                      }
                    </p>
                    {!searchTerm && getActiveFiltersCount() === 0 && (
                      <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={createServiceUrl}>
                          {t('directory.empty.button')}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
                      : "space-y-3 sm:space-y-4"
                  }>
                    {paginatedBusinesses.map((business) => (
                    <Card key={business.id} className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white ${
                      viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                    }`}>
                      {/* Hero Image */}
                      {business.heroImage ? (
                        <div className={`relative ${viewMode === 'list' ? 'sm:w-72 sm:h-full' : 'h-48 sm:h-56'} overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100`}>
                          <img
                            src={business.heroImage}
                            alt={business.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              console.error('Erreur de chargement image:', business.heroImage)
                              // Cache l'image et affiche le parent comme fallback
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 flex items-center justify-center">
                                    <svg class="h-16 w-16 sm:h-20 sm:w-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                  </div>
                                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                                  <span class="absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-emerald-700 border-0 shadow-lg">
                                    ${business.category}
                                  </span>
                                `
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-700 border-0 shadow-lg">
                            {business.category}
                          </Badge>
                        </div>
                      ) : (
                        <div className={`relative ${viewMode === 'list' ? 'sm:w-72 sm:h-full' : 'h-48 sm:h-56'} overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 flex items-center justify-center`}>
                          <Building2 className="h-16 w-16 sm:h-20 sm:w-20 text-white/30" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                          <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-700 border-0 shadow-lg">
                            {business.category}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <CardHeader className="p-4 sm:p-6 pb-3">
                          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {business.name}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="flex-1 space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                          {business.description && (
                            <p className="text-gray-600 text-sm sm:text-base line-clamp-2 leading-relaxed">
                              {business.description}
                            </p>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-start text-sm text-gray-700">
                              <MapPin className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1 font-medium">{business.address}</span>
                            </div>
                            
                            {business.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span>{business.phone}</span>
                              </div>
                            )}
                            
                            {business.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span className="line-clamp-1">{business.email}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <div className="p-4 sm:p-6 pt-0">
                          <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg h-11 text-base font-medium group">
                            <Link href={getBusinessUrl(business.subdomain)}>
                              Voir la page
                              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {filteredBusinesses.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {/* Items per page selector et info */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Affichage</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value={9}>9</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span>par page</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {filteredBusinesses.length > 0 && (
                          <span>
                            Affichage <span className="font-semibold">{startIndex + 1}</span> à{' '}
                            <span className="font-semibold">{Math.min(endIndex, filteredBusinesses.length)}</span> sur{' '}
                            <span className="font-semibold">{filteredBusinesses.length}</span> résultat{filteredBusinesses.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pagination buttons */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="h-9"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Précédent</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          {/* Première page */}
                          {currentPage > 3 && (
                            <>
                              <Button
                                onClick={() => handlePageChange(1)}
                                variant={currentPage === 1 ? "default" : "outline"}
                                size="sm"
                                className={`h-9 w-9 ${currentPage === 1 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}`}
                              >
                                1
                              </Button>
                              {currentPage > 4 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                            </>
                          )}

                          {/* Pages autour de la page courante */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Afficher 5 pages max : 2 avant, la courante, 2 après
                              return page >= currentPage - 2 && page <= currentPage + 2
                            })
                            .map(page => (
                              <Button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className={`h-9 w-9 ${currentPage === page ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}`}
                              >
                                {page}
                              </Button>
                            ))}

                          {/* Dernière page */}
                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <Button
                                onClick={() => handlePageChange(totalPages)}
                                variant={currentPage === totalPages ? "default" : "outline"}
                                size="sm"
                                className={`h-9 w-9 ${currentPage === totalPages ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}`}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="h-9"
                        >
                          <span className="hidden sm:inline mr-1">Suivant</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
              )}
            </>
          )}

          {/* CTA Section responsive */}
          <Card className="mt-8 sm:mt-12 lg:mt-16 bg-emerald-600 border-0 shadow-2xl">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center text-white">
              <div className="p-3 sm:p-4 bg-white/20 rounded-full w-fit mx-auto mb-4 sm:mb-6">
                <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
                {t('directory.cta.title')}
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {t('directory.cta.subtitle')}
              </p>
              <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3">
                <Link href={createServiceUrl}>
                  {t('directory.cta.button')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Drawer de filtres */}
      <BusinessFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
        businesses={businesses}
      />
    </div>
  )
} 