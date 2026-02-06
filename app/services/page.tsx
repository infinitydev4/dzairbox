"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { useSession } from "next-auth/react"
import { 
  Building2,
  Search,
  Megaphone,
  Users,
  BarChart3,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Smartphone,
  Mail,
  Phone,
  Shield,
  Zap,
  TrendingUp,
  Eye,
  Heart
} from "lucide-react"
import Link from "next/link"

interface Service {
  id: string
  icon: any
  color: string
  popular?: boolean
}

export default function ServicesPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const createServiceUrl = session ? '/dashboard/create-business' : '/create-service'

  const services: Service[] = [
    { id: 'directory', icon: Search, color: 'emerald' },
    { id: 'businessPage', icon: Building2, color: 'blue', popular: true },
    { id: 'advertising', icon: Megaphone, color: 'purple' },
    { id: 'analytics', icon: BarChart3, color: 'orange' },
    { id: 'seo', icon: TrendingUp, color: 'green' },
    { id: 'support', icon: Shield, color: 'indigo' }
  ]

  const categories = [
    { id: 'all', name: t('servicesPage.categories.all'), icon: Globe },
    { id: 'core', name: t('servicesPage.categories.core'), icon: Star },
    { id: 'marketing', name: t('servicesPage.categories.marketing'), icon: Megaphone },
    { id: 'tech', name: t('servicesPage.categories.tech'), icon: Zap }
  ]

  const filteredServices = selectedCategory === 'all' ? services : services.filter(service => {
    switch (selectedCategory) {
      case 'core': return ['directory', 'businessPage'].includes(service.id)
      case 'marketing': return ['advertising', 'seo'].includes(service.id)
      case 'tech': return ['analytics', 'support'].includes(service.id)
      default: return true
    }
  })

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200'
    }
    return colors[color as keyof typeof colors] || colors.emerald
  }

  const getServiceFeatures = (serviceId: string): string[] => {
    const featuresMap = {
      directory: [
        t('servicesPage.directory.features.search'),
        t('servicesPage.directory.features.geolocation'),
        t('servicesPage.directory.features.filters'),
        t('servicesPage.directory.features.details'),
        t('servicesPage.directory.features.mobile')
      ],
      businessPage: [
        t('servicesPage.businessPage.features.customPage'),
        t('servicesPage.businessPage.features.gallery'),
        t('servicesPage.businessPage.features.contact'),
        t('servicesPage.businessPage.features.seo'),
        t('servicesPage.businessPage.features.responsive'),
        t('servicesPage.businessPage.features.stats')
      ],
      advertising: [
        t('servicesPage.advertising.features.banners'),
        t('servicesPage.advertising.features.featured'),
        t('servicesPage.advertising.features.geolocated'),
        t('servicesPage.advertising.features.targeted'),
        t('servicesPage.advertising.features.reports'),
        t('servicesPage.advertising.features.support')
      ],
      analytics: [
        t('servicesPage.analytics.features.visits'),
        t('servicesPage.analytics.features.behavior'),
        t('servicesPage.analytics.features.reports'),
        t('servicesPage.analytics.features.conversions'),
        t('servicesPage.analytics.features.recommendations')
      ],
      seo: [
        t('servicesPage.seo.features.keywords'),
        t('servicesPage.seo.features.local'),
        t('servicesPage.seo.features.technical'),
        t('servicesPage.seo.features.content'),
        t('servicesPage.seo.features.tracking')
      ],
      support: [
        t('servicesPage.support.features.priority'),
        t('servicesPage.support.features.advice'),
        t('servicesPage.support.features.training'),
        t('servicesPage.support.features.content'),
        t('servicesPage.support.features.multichannel')
      ]
    }
    return featuresMap[serviceId as keyof typeof featuresMap] || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Header />
      <main className="container py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-emerald-100 rounded-full mb-6">
              <Star className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('servicesPage.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t('servicesPage.subtitle')}
            </p>
          </div>

          <div className="mb-8 sm:mb-12">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base ${
                          selectedCategory === category.id 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                            : 'border-gray-200 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{category.name}</span>
                        <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{t('servicesPage.stats.businesses')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">48</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{t('servicesPage.stats.wilayas')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">10K+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{t('servicesPage.stats.visitors')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">98%</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{t('servicesPage.stats.satisfaction')}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {filteredServices.map((service) => {
              const Icon = service.icon
              const features = getServiceFeatures(service.id)
              return (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:scale-105 relative overflow-hidden">
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-emerald-600 text-white">
                        ⭐ {t('servicesPage.businessPage.popular')}
                      </Badge>
                    </div>
                  )}
                  
                  {service.id === 'directory' && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {t('servicesPage.directory.badge')}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="p-6 sm:p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 sm:p-4 rounded-xl ${getColorClasses(service.color)} flex-shrink-0`}>
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {t(`servicesPage.${service.id}.title`)}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {t(`servicesPage.${service.id}.description`)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">{t('servicesPage.common.featuresIncluded')}</h4>
                      <ul className="space-y-2">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 text-xs sm:text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('servicesPage.common.startingFrom')}</div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900">{t(`servicesPage.${service.id}.price`)}</div>
                      </div>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <span className="mr-2">{t('servicesPage.common.learnMore')}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-emerald-600 border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center text-white">
              <div className="p-4 sm:p-6 bg-white/20 rounded-full w-fit mx-auto mb-6">
                <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {t('servicesPage.cta.title')}
              </h3>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {t('servicesPage.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-3">
                  <Link href={createServiceUrl}>
                    {t('servicesPage.cta.createBusiness')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-emerald-600 hover:text-white text-lg px-8 py-3">
                  <Link href="/businesses">
                    {t('servicesPage.cta.exploreDirectory')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-12 sm:mt-16 bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('servicesPage.contact.title')}
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                {t('servicesPage.contact.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  <Mail className="h-4 w-4 mr-2" />
                  contact@dzairbox.com
                </Button>
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  <Phone className="h-4 w-4 mr-2" />
                  +213 XXX XXX XXX
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 