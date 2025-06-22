"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Users, Search, Shield, User, Mail, Calendar, Building2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface UserData {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN"
  createdAt: string
  _count: {
    businesses: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des utilisateurs",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (roleFilter === "admin") {
      filtered = filtered.filter(u => u.role === "ADMIN")
    } else if (roleFilter === "user") {
      filtered = filtered.filter(u => u.role === "USER")
    }

    if (searchTerm) {
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Rôle mis à jour vers ${newRole}`,
        })
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du rôle",
        variant: "destructive"
      })
    }
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
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les utilisateurs et leurs permissions sur DzBusiness
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin">Retour au dashboard</Link>
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={roleFilter === "all" ? "default" : "outline"}
                    onClick={() => setRoleFilter("all")}
                    size="sm"
                  >
                    Tous ({users.length})
                  </Button>
                  <Button 
                    variant={roleFilter === "user" ? "default" : "outline"}
                    onClick={() => setRoleFilter("user")}
                    size="sm"
                  >
                    Utilisateurs ({users.filter(u => u.role === "USER").length})
                  </Button>
                  <Button 
                    variant={roleFilter === "admin" ? "default" : "outline"}
                    onClick={() => setRoleFilter("admin")}
                    size="sm"
                  >
                    Admins ({users.filter(u => u.role === "ADMIN").length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Utilisateurs ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                            {user.name || "Nom non défini"}
                            {user.role === "ADMIN" && (
                              <Shield className="ml-2 w-4 h-4 text-red-500" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="flex items-center">
                              <Building2 className="w-3 h-3 mr-1" />
                              {user._count.businesses} entreprise(s)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
                          </span>
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
                                onClick={() => handleRoleChange(
                                  user.id, 
                                  user.role === "ADMIN" ? "USER" : "ADMIN"
                                )}
                              >
                                {user.role === "ADMIN" ? "Rétrograder" : "Promouvoir admin"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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