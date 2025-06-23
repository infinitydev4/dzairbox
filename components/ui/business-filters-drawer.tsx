"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { 
  X,
  Filter,
  Search,
  MapPin,
  Building2,
  Star,
  Clock,
  DollarSign,
  Users,
  Sliders
} from "lucide-react"

interface BusinessFiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange: (filters: BusinessFilters) => void
  businesses: any[]
}

export interface BusinessFilters {
  search: string
  category: string
  city: string
  hasPhone: boolean
  hasEmail: boolean
  hasWebsite: boolean
  sortBy: 'name' | 'category' | 'newest'
}

export function BusinessFiltersDrawer({ 
  isOpen, 
  onClose, 
  onFiltersChange, 
  businesses 
}: BusinessFiltersDrawerProps) {
  const { t } = useLanguage()
  
  const [filters, setFilters] = useState<BusinessFilters>({
    search: '',
    category: '',
    city: '',
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false,
    sortBy: 'name'
  })

  // Extraire les catégories uniques
  const categories = [...new Set(businesses.map(b => b.category))].sort()
  
  // Extraire les villes uniques
  const cities = [...new Set(businesses.map(b => {
    const cityPart = b.address.split(',')[0]?.trim()
    return cityPart
  }).filter(Boolean))].sort()

  const handleFilterChange = (key: keyof BusinessFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const emptyFilters: BusinessFilters = {
      search: '',
      category: '',
      city: '',
      hasPhone: false,
      hasEmail: false,
      hasWebsite: false,
      sortBy: 'name'
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category) count++
    if (filters.city) count++
    if (filters.hasPhone) count++
    if (filters.hasEmail) count++
    if (filters.hasWebsite) count++
    if (filters.sortBy !== 'name') count++
    return count
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Filter className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filtres de recherche</h2>
                <p className="text-sm text-gray-600">
                  {getActiveFiltersCount()} filtre(s) actif(s)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Recherche textuelle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <span>Recherche</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Nom, description, adresse..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Catégorie */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span>Catégorie</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                {/* Affichage des catégories populaires */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Catégories populaires :</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((category) => (
                      <Badge
                        key={category}
                        variant={filters.category === category ? "default" : "secondary"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleFilterChange('category', filters.category === category ? '' : category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localisation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>Localisation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Villes populaires */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Villes populaires :</p>
                  <div className="flex flex-wrap gap-2">
                    {cities.slice(0, 4).map((city) => (
                      <Badge
                        key={city}
                        variant={filters.city === city ? "default" : "secondary"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleFilterChange('city', filters.city === city ? '' : city)}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations disponibles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Informations disponibles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasPhone}
                      onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Numéro de téléphone</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasEmail}
                      onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Adresse email</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasWebsite}
                      onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Site web</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Tri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-gray-600" />
                  <span>Trier par</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="name"
                      checked={filters.sortBy === 'name'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Nom (A-Z)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="category"
                      checked={filters.sortBy === 'category'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Catégorie</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value="newest"
                      checked={filters.sortBy === 'newest'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Plus récents</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques des résultats */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">
                    {businesses.length}
                  </div>
                  <div className="text-sm text-emerald-600">
                    entreprises trouvées
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1"
                disabled={getActiveFiltersCount() === 0}
              >
                Effacer tout
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 