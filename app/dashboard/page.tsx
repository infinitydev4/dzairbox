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
            <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl text-white font-medium py-6 text-base transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5">
              <Link href="/dashboard/businesses" className="flex items-center justify-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>{t('dashboard.myBusinesses.button')}</span>
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
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-600/25 rounded-xl text-white font-medium py-6 text-base transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5" variant="default">
              <Link href="/dashboard/create-business" className="flex items-center justify-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>{t('dashboard.newBusiness.button')}</span>
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
            <Button asChild className="w-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 hover:text-purple-800 font-medium py-6 text-base transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 hover:-translate-y-0.5 rounded-xl" variant="outline">
              <Link href="/dashboard/profile" className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('dashboard.profile.button')}</span>
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
            <Button asChild className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-800 font-medium py-6 text-base transition-all duration-300 hover:shadow-lg hover:shadow-gray-600/20 hover:-translate-y-0.5 rounded-xl" variant="outline">
              <Link href="/dashboard/settings" className="flex items-center justify-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t('dashboard.settings.button')}</span>
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
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-600/25 rounded-xl text-white font-medium py-6 text-base transition-all duration-300 hover:shadow-xl hover:shadow-orange-600/30 hover:-translate-y-0.5">
                <Link href="/admin" className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{t('dashboard.admin.button')}</span>
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
            <span>{t('dashboard.tips.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>{t('dashboard.tips.tip1')}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>{t('dashboard.tips.tip2')}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>{t('dashboard.tips.tip3')}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>{t('dashboard.tips.tip4')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 