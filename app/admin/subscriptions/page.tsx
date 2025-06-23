"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  CreditCard,
  Crown,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Eye,
  MoreHorizontal,
  DollarSign,
  Zap,
  Star,
  Clock,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from "lucide-react"

interface Subscription {
  id: string
  businessId: string
  businessName: string
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  startDate: string
  endDate: string
  amount: number
  features: string[]
  ownerName: string
  ownerEmail: string
  paymentMethod?: string
  lastPayment?: string
  nextPayment?: string
}

export default function AdminSubscriptionsPage() {
  // Données mockées directement en français
  const mockSubscriptions: Subscription[] = [
    {
      id: "sub_001",
      businessId: "bus_001",
      businessName: "Restaurant Le Délice",
      plan: "PREMIUM",
      status: "ACTIVE",
      startDate: "2024-01-15",
      endDate: "2024-12-15",
      amount: 299,
      features: [
        "Photos illimitées",
        "Analytics avancés",
        "Support prioritaire",
        "SEO optimisé"
      ],
      ownerName: "Ahmed Benali",
      ownerEmail: "ahmed@ledelice.dz",
      paymentMethod: "Carte bancaire",
      lastPayment: "2024-01-15",
      nextPayment: "2024-02-15"
    },
    {
      id: "sub_002",
      businessId: "bus_002",
      businessName: "Coiffure Moderne",
      plan: "BASIC",
      status: "ACTIVE",
      startDate: "2024-02-01",
      endDate: "2024-08-01",
      amount: 99,
      features: [
        "5 photos",
        "Profil de base",
        "Support email"
      ],
      ownerName: "Fatima Kaci",
      ownerEmail: "fatima@coiffure-moderne.dz",
      paymentMethod: "CCP",
      lastPayment: "2024-02-01",
      nextPayment: "2024-03-01"
    },
    {
      id: "sub_003",
      businessId: "bus_003",
      businessName: "Solutions Technologiques",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      amount: 999,
      features: [
        "Tout illimité",
        "Accès API",
        "Support 24/7",
        "Domaine personnalisé",
        "Marque blanche"
      ],
      ownerName: "Karim Meziane",
      ownerEmail: "karim@techsolutions.dz",
      paymentMethod: "Virement bancaire",
      lastPayment: "2024-01-01",
      nextPayment: "2024-01-01"
    },
    {
      id: "sub_004",
      businessId: "bus_004",
      businessName: "Épicerie du Coin",
      plan: "FREE",
      status: "ACTIVE",
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      amount: 0,
      features: [
        "Profil de base",
        "1 photo",
        "Support communautaire"
      ],
      ownerName: "Said Boumediene",
      ownerEmail: "said@epicerie.dz"
    },
    {
      id: "sub_005",
      businessId: "bus_005",
      businessName: "Garage Auto Plus",
      plan: "BASIC",
      status: "EXPIRED",
      startDate: "2023-12-01",
      endDate: "2024-01-01",
      amount: 99,
      features: [
        "5 photos",
        "Profil de base",
        "Support email"
      ],
      ownerName: "Omar Benaissa",
      ownerEmail: "omar@garageauto.dz",
      paymentMethod: "Carte bancaire",
      lastPayment: "2023-12-01"
    }
  ]

  const [subscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'plans' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")

  // Filtrage des abonnements
  useEffect(() => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    if (planFilter !== "all") {
      filtered = filtered.filter(sub => sub.plan === planFilter)
    }

    setFilteredSubscriptions(filtered)
  }, [searchTerm, statusFilter, planFilter, subscriptions])

  // Statistiques calculées
  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'ACTIVE').length,
    totalRevenue: subscriptions.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + s.amount, 0),
    expiringCount: 1
  }

  const planStats = {
    FREE: subscriptions.filter(s => s.plan === 'FREE').length,
    BASIC: subscriptions.filter(s => s.plan === 'BASIC').length,
    PREMIUM: subscriptions.filter(s => s.plan === 'PREMIUM').length,
    ENTERPRISE: subscriptions.filter(s => s.plan === 'ENTERPRISE').length
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'gray'
      case 'BASIC': return 'blue'
      case 'PREMIUM': return 'purple'
      case 'ENTERPRISE': return 'emerald'
      default: return 'gray'
    }
  }

  const tabs = [
    {
      key: 'overview' as const,
      label: 'Vue d\'ensemble',
      icon: BarChart3,
      color: 'blue'
    },
    {
      key: 'subscriptions' as const,
      label: 'Abonnements',
      icon: CreditCard,
      color: 'emerald'
    },
    {
      key: 'plans' as const,
      label: 'Plans',
      icon: Package,
      color: 'purple'
    },
    {
      key: 'analytics' as const,
      label: 'Analytics',
      icon: PieChart,
      color: 'orange'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - Style admin standard */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Abonnements
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les abonnements et plans des entreprises
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Navigation par onglets - Style admin */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistiques principales - Style admin cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abonnements</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  +12% ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)}% taux d'activité
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} DA</div>
                <p className="text-xs text-muted-foreground">
                  +8% ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirent Bientôt</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.expiringCount}</div>
                <p className="text-xs text-muted-foreground">
                  dans 30 jours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Répartition par plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Répartition par Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(planStats).map(([plan, count]) => {
                  const percentage = Math.round((count / stats.totalSubscriptions) * 100)
                  const color = getPlanColor(plan)
                  return (
                    <div key={plan} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{plan}</span>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{percentage}% du total</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Filtres et recherche - Style admin */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par entreprise, propriétaire ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-3">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="EXPIRED">Expiré</option>
                    <option value="CANCELLED">Annulé</option>
                    <option value="PENDING">En attente</option>
                  </select>
                  
                  <select 
                    value={planFilter} 
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Tous les plans</option>
                    <option value="FREE">Gratuit</option>
                    <option value="BASIC">Basique</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Entreprise</option>
                  </select>
                  
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des abonnements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Liste des Abonnements</span>
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {filteredSubscriptions.length} résultats
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Entreprise
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Montant
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Dates
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{subscription.businessName}</p>
                            <p className="text-sm text-gray-500">{subscription.ownerName}</p>
                            <p className="text-sm text-gray-500">{subscription.ownerEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscription.plan === 'FREE' ? 'bg-gray-100 text-gray-800' :
                            subscription.plan === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                            subscription.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {subscription.plan}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscription.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                            subscription.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscription.status === 'ACTIVE' ? 'Actif' :
                             subscription.status === 'EXPIRED' ? 'Expiré' :
                             subscription.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {subscription.amount > 0 ? `${subscription.amount.toLocaleString()} DA` : 'Gratuit'}
                          </p>
                          {subscription.paymentMethod && (
                            <p className="text-sm text-gray-500">{subscription.paymentMethod}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-gray-900">Début: {new Date(subscription.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-900">Fin: {new Date(subscription.endDate).toLocaleDateString()}</p>
                            {subscription.nextPayment && (
                              <p className="text-emerald-600 font-medium">
                                Prochain: {new Date(subscription.nextPayment).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Gratuit',
                price: 0,
                color: 'gray',
                features: [
                  '1 photo',
                  'Profil de base',
                  'Support communautaire'
                ]
              },
              {
                name: 'Basique',
                price: 99,
                color: 'blue',
                features: [
                  '5 photos',
                  'Profil complet',
                  'Support email',
                  'Analytics de base'
                ]
              },
              {
                name: 'Premium',
                price: 299,
                color: 'purple',
                popular: true,
                features: [
                  'Photos illimitées',
                  'Analytics avancés',
                  'Support prioritaire',
                  'SEO optimisé'
                ]
              },
              {
                name: 'Entreprise',
                price: 999,
                color: 'emerald',
                features: [
                  'Tout illimité',
                  'Accès API',
                  'Support 24/7',
                  'Domaine personnalisé',
                  'Marque blanche'
                ]
              }
            ].map((planData) => {
              const subscribers = planStats[planData.name.toUpperCase() as keyof typeof planStats] || 0
              return (
                <Card key={planData.name} className={`relative ${planData.popular ? 'ring-2 ring-purple-500' : ''}`}>
                  {planData.popular && (
                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Populaire</span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900">{planData.name}</h3>
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">
                            {subscribers} abonnés
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {planData.price > 0 ? `${planData.price.toLocaleString()} DA` : 'Gratuit'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {planData.price > 0 ? '/mois' : 'pour toujours'}
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {planData.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button className="w-full" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier le plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Analytics Avancés</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Analytics à venir
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Des outils d'analyse détaillés pour suivre les performances des abonnements seront bientôt disponibles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900">Analyse des revenus</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <Activity className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-900">Suivi de croissance</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-900">Taux de rétention</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 