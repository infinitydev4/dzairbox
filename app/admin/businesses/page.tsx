"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { getBusinessUrl } from "@/lib/business-url"

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
  isActive: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function AdminBusinessesPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchBusinesses()
    }
  }, [session])

  useEffect(() => {
    filterBusinesses()
  }, [businesses, searchTerm, statusFilter])

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/businesses")
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error("Error fetching businesses:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des entreprises",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterBusinesses = () => {
    let filtered = businesses

    if (statusFilter === "active") {
      filtered = filtered.filter(b => b.isActive)
    } else if (statusFilter === "pending") {
      filtered = filtered.filter(b => !b.isActive)
    }

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBusinesses(filtered)
  }

  const handleStatusChange = async (businessId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Entreprise ${newStatus ? "activée" : "désactivée"} avec succès`,
        })
        fetchBusinesses()
      } else {
        throw new Error("Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Error updating business status:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (businessId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Entreprise supprimée avec succès",
        })
        fetchBusinesses()
      } else {
        throw new Error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting business:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Entreprises
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez et validez les entreprises inscrites sur DzBusiness
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin">
                Retour au dashboard
              </Link>
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtres et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom, catégorie, adresse ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    size="sm"
                  >
                    Toutes ({businesses.length})
                  </Button>
                  <Button 
                    variant={statusFilter === "active" ? "default" : "outline"}
                    onClick={() => setStatusFilter("active")}
                    size="sm"
                  >
                    Actives ({businesses.filter(b => b.isActive).length})
                  </Button>
                  <Button 
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                    size="sm"
                  >
                    En attente ({businesses.filter(b => !b.isActive).length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Entreprises ({filteredBusinesses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBusinesses.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune entreprise trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBusinesses.map((business) => (
                    <div 
                      key={business.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {business.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="font-medium">{business.category}</span>
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {business.address}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                business.isActive 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-orange-100 text-orange-800"
                              }`}>
                                {business.isActive ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    En attente
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {business.description && (
                            <p className="text-gray-700 text-sm line-clamp-2">
                              {business.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {business.user.email}
                              </span>
                              {business.phone && (
                                <span className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {business.phone}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Créée le {new Date(business.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {business.isActive && (
                                <Button asChild size="sm" variant="outline">
                                  <Link 
                                    href={getBusinessUrl(business.subdomain)}
                                    target="_blank"
                                    className="flex items-center"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Voir
                                  </Link>
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(business.id, !business.isActive)}
                                  >
                                    {business.isActive ? "Désactiver" : "Activer"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(business.id)}
                                    className="text-red-600"
                                  >
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
  )
} 