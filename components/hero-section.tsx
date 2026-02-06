"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Users, Star, Search, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/businesses?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/businesses')
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20 pb-32 sm:pt-32 sm:pb-40">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"></div>

      <div className="container relative">
        <div className="mx-auto max-w-5xl text-center">
          {/* Stats Badge with animation */}
          <div className="mb-8 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-100 to-green-100 px-5 py-2.5 text-sm font-medium text-emerald-800 shadow-lg border border-emerald-200 animate-fade-in">
            <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
            {t("hero.trustBadge")}
          </div>

          {/* Main headline with gradient */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {t("hero.title").split(' ')[0]}
            </span>{' '}
            <span>{t("hero.title").split(' ').slice(1).join(' ')}</span>
          </h1>

          <p className="mb-10 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une entreprise, un service..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 rounded-xl"
              >
                Rechercher
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href="/create-service">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group border-0"
              >
                {t("hero.register")}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/businesses">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-emerald-500 px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {t("hero.find")}
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators with improved design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                5000+
              </div>
              <div className="text-sm text-gray-600 font-medium">{t("hero.stats.businesses")}</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                69
              </div>
              <div className="text-sm text-gray-600 font-medium">{t("hero.stats.wilayas")}</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  4.9
                </span>
                <Star className="h-7 w-7 text-yellow-400 fill-current ml-1" />
              </div>
              <div className="text-sm text-gray-600 font-medium">{t("hero.stats.rating")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
