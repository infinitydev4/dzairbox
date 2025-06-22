"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Users,
  Building2,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import Link from "next/link"

interface ReportData {
  users: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  businesses: {
    total: number
    active: number
    pending: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  monthly: {
    month: string
    users: number
    businesses: number
  }[]
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchReportData()
    }
  }, [session])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/reports")
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dzbusiness-${type}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading report:", error)
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
                Rapports et Statistiques
              </h1>
              <p className="text-gray-600 mt-2">
                Analyse détaillée de l'activité sur DzBusiness
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin">Retour au dashboard</Link>
            </Button>
          </div>

          {/* Export Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Exporter les données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => downloadReport("users")} 
                  variant="outline" 
                  className="flex items-center justify-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Exporter Utilisateurs
                </Button>
                <Button 
                  onClick={() => downloadReport("businesses")} 
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Exporter Entreprises
                </Button>
                <Button 
                  onClick={() => downloadReport("full")} 
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rapport Complet
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reportData ? (
            <>
              {/* Growth Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Utilisateurs Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {reportData.users.total}
                    </div>
                    <div className="flex items-center mt-2">
                      {reportData.users.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        reportData.users.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(reportData.users.growth)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Entreprises Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {reportData.businesses.total}
                    </div>
                    <div className="flex items-center mt-2">
                      {reportData.businesses.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        reportData.businesses.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(reportData.businesses.growth)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Nouvelles Inscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {reportData.users.thisMonth}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Ce mois-ci
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Entreprises en Attente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {reportData.businesses.pending}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Nécessitent validation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Tendances Mensuelles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.monthly.map((month) => (
                      <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{month.month}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{month.users} utilisateurs</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-green-500" />
                            <span>{month.businesses} entreprises</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Vue d'ensemble des performances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.businesses.active}
                      </div>
                      <p className="text-sm text-gray-600">Entreprises Actives</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(reportData.businesses.active / reportData.businesses.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {reportData.businesses.pending}
                      </div>
                      <p className="text-sm text-gray-600">En Attente</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(reportData.businesses.pending / reportData.businesses.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.businesses.total > 0 ? Math.round((reportData.businesses.active / reportData.businesses.total) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600">Taux d'Approbation</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${reportData.businesses.total > 0 ? (reportData.businesses.active / reportData.businesses.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune donnée de rapport disponible</p>
            </div>
          )}
      </div>
  )
} 