"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useLanguage } from "@/components/language-provider"
import { useSession } from "next-auth/react"
import { 
  Target,
  Users,
  MapPin,
  Eye,
  Heart,
  Lightbulb,
  Globe,
  Handshake,
  TrendingUp,
  Rocket,
  Building2,
  Star,
  Award,
  Calendar,
  ArrowRight,
  Mail,
  Phone,
  Linkedin,
  Twitter
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const createServiceUrl = session ? '/dashboard/create-business' : '/create-service'

  const values = [
    {
      icon: Globe,
      key: 'accessibility',
      color: 'emerald'
    },
    {
      icon: MapPin,
      key: 'local',
      color: 'blue'
    },
    {
      icon: Lightbulb,
      key: 'innovation',
      color: 'purple'
    },
    {
      icon: Handshake,
      key: 'support',
      color: 'orange'
    }
  ]

  const timeline = [
    {
      key: 'founding',
      icon: Calendar,
      color: 'emerald'
    },
    {
      key: 'growth', 
      icon: TrendingUp,
      color: 'blue'
    },
    {
      key: 'innovation',
      icon: Rocket,
      color: 'purple'
    }
  ]

  const mission = [
    {
      key: 'digital',
      icon: Building2,
      color: 'emerald'
    },
    {
      key: 'economy',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      key: 'future',
      icon: Rocket,
      color: 'purple'
    }
  ]

  const team = [
    {
      key: 'ceo',
      avatar: '/avatars/ceo.jpg'
    },
    {
      key: 'cto',
      avatar: '/avatars/cto.jpg'
    },
    {
      key: 'marketing',
      avatar: '/avatars/marketing.jpg'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    }
    return colors[color as keyof typeof colors] || colors.emerald
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Header />
      <main className="container py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-emerald-100 rounded-full mb-6">
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('aboutPage.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t('aboutPage.subtitle')}
            </p>
          </div>

          {/* Mission Hero */}
          <Card className="mb-12 sm:mb-16 bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center text-white">
              <div className="p-4 sm:p-6 bg-white/20 rounded-full w-fit mx-auto mb-6">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {t('aboutPage.hero.title')}
              </h2>
              <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                {t('aboutPage.hero.description')}
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {t('aboutPage.stats.businesses.number')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('aboutPage.stats.businesses.label')}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {t('aboutPage.stats.wilayas.number')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('aboutPage.stats.wilayas.label')}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {t('aboutPage.stats.visits.number')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('aboutPage.stats.visits.label')}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {t('aboutPage.stats.satisfaction.number')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('aboutPage.stats.satisfaction.label')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Story Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('aboutPage.story.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {t('aboutPage.story.description')}
              </p>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {timeline.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={item.key} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${getColorClasses(item.color)} w-fit mx-auto mb-4 sm:mb-6`}>
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                        {t(`aboutPage.story.${item.key}.title`)}
                      </h3>
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2 sm:mb-3">
                        {t(`aboutPage.story.${item.key}.year`) || t(`aboutPage.story.${item.key}.milestone`) || t(`aboutPage.story.${item.key}.feature`)}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {t(`aboutPage.story.${item.key}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('aboutPage.values.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                {t('aboutPage.values.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.key} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 sm:p-4 rounded-xl ${getColorClasses(value.color)} flex-shrink-0`}>
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                            {t(`aboutPage.values.${value.key}.title`)}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {t(`aboutPage.values.${value.key}.description`)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('aboutPage.team.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                {t('aboutPage.team.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {team.map((member) => (
                <Card key={member.key} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                      <span className="text-white font-bold text-xl sm:text-2xl">
                        {t(`aboutPage.team.${member.key}.name`).charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {t(`aboutPage.team.${member.key}.name`)}
                    </h3>
                    <div className="text-emerald-600 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                      {t(`aboutPage.team.${member.key}.role`)}
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {t(`aboutPage.team.${member.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('aboutPage.mission.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                {t('aboutPage.mission.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {mission.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.key} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <div className={`p-3 sm:p-4 rounded-xl ${getColorClasses(item.color)} w-fit mx-auto mb-4 sm:mb-6`}>
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {t(`aboutPage.mission.${item.key}.title`)}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {t(`aboutPage.mission.${item.key}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-emerald-600 border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center text-white">
              <div className="p-4 sm:p-6 bg-white/20 rounded-full w-fit mx-auto mb-6">
                <Handshake className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {t('aboutPage.contact.title')}
              </h3>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {t('aboutPage.contact.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-3">
                  <Link href={createServiceUrl}>
                    {t('aboutPage.contact.business')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-white hover:text-emerald-600 text-lg px-8 py-3">
                  <Link href="/contact">
                    {t('aboutPage.contact.partnership')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Footer */}
          <Card className="mt-12 sm:mt-16 bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                {t('aboutPage.stats.title')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                    {t('aboutPage.stats.businesses.number')}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {t('aboutPage.stats.businesses.label')}
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                    {t('aboutPage.stats.wilayas.number')}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {t('aboutPage.stats.wilayas.label')}
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                    {t('aboutPage.stats.visits.number')}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {t('aboutPage.stats.visits.label')}
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                    {t('aboutPage.stats.satisfaction.number')}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {t('aboutPage.stats.satisfaction.label')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 