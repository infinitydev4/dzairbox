"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertTriangle,
  Activity,
  BarChart3
} from "lucide-react"
import Link from "next/link"

interface AdminStats {
  users: {
    total: number
    active: number
    newThisMonth: number
  }
  businesses: {
    total: number
    active: number
    pending: number
    rejected: number
  }
  subscriptions: {
    total: number
    active: number
    expired: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setIsLoading(false)
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600 mt-2">
              Gestion des utilisateurs, entreprises et abonnements DzBusiness
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-auto py-4">
              <Link href="/admin/businesses?filter=pending" className="flex flex-col items-center space-y-2">
                <Clock className="h-6 w-6" />
                <span>Entreprises en attente</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/users" className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Gérer les utilisateurs</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/businesses" className="flex flex-col items-center space-y-2">
                <Building2 className="h-6 w-6" />
                <span>Toutes les entreprises</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin/reports" className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Rapports</span>
              </Link>
            </Button>
          </div>

          {/* Statistics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.users.newThisMonth} ce mois-ci
                  </p>
                </CardContent>
              </Card>

              {/* Total Businesses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entreprises Total</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.businesses.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.businesses.active} actives
                  </p>
                </CardContent>
              </Card>

              {/* Pending Businesses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.businesses.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entreprises à valider
                  </p>
                </CardContent>
              </Card>

              {/* Revenue/Subscriptions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.subscriptions.active}</div>
                  <p className="text-xs text-muted-foreground">
                    Sur {stats.subscriptions.total} total
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Business Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  État des Entreprises
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Actives</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {stats.businesses.active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">En attente</span>
                      </div>
                      <span className="font-semibold text-orange-600">
                        {stats.businesses.pending}
                      </span>
                    </div>
                    {stats.businesses.rejected > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Rejetées</span>
                        </div>
                        <span className="font-semibold text-red-600">
                          {stats.businesses.rejected}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/businesses?filter=pending">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                    Valider les entreprises en attente ({stats?.businesses.pending || 0})
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/users?filter=recent">
                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                    Nouveaux utilisateurs ce mois ({stats?.users.newThisMonth || 0})
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/reports">
                    <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                    Générer un rapport
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>
                Les dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Fonctionnalité d'activité récente à venir</p>
              </div>
            </CardContent>
          </Card>
      </div>
  )
} 