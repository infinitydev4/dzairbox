"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { usePendingBusiness } from "@/hooks/use-pending-business"
import { Loader2, Building2, Plus, User, Settings, Shield } from "lucide-react"

export default function DashboardPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const { isCreating } = usePendingBusiness()

  if (isCreating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.createBusiness')}</h2>
            <p className="text-gray-600">{t('dashboard.createBusinessSubtitle')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl shadow-sm">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('dashboard.myBusinesses.title')}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t('dashboard.myBusinesses.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl">
              <Link href="/dashboard/businesses">
                {t('common.view')} {t('dashboard.myBusinesses.title').toLowerCase()}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-sm">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('dashboard.newBusiness.title')}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t('dashboard.newBusiness.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-600/25 rounded-xl" variant="default">
              <Link href="/dashboard/create-business">
                {t('dashboard.newBusiness.title')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-sm">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('dashboard.profile.title')}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t('dashboard.profile.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/profile">
                {t('common.view')} {t('dashboard.profile.title').toLowerCase()}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl shadow-sm">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">{t('dashboard.settings.title')}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t('dashboard.settings.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/settings">
                {t('dashboard.settings.title')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {session?.user?.role === "ADMIN" && (
          <Card className="hover:shadow-xl transition-all duration-300 border border-orange-200/70 bg-gradient-to-br from-orange-50/70 to-red-50/70 backdrop-blur-sm hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-sm">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">{t('dashboard.admin.title')}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {t('dashboard.admin.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-600/25 rounded-xl">
                <Link href="/admin">
                  {t('dashboard.admin.title')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats or Tips */}
      <Card className="bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <span>💡</span>
            <span>Conseils pour améliorer votre visibilité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Assurez-vous que vos informations sont complètes et à jour</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Ajoutez des photos de qualité de votre entreprise</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Répondez rapidement aux demandes de vos clients</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Mettez à jour vos horaires d'ouverture régulièrement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 