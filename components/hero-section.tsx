"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Users, Star } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Stats Badge */}
          <div className="mb-8 inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
            <Users className="mr-2 h-4 w-4" />
            {t("hero.trustBadge")}
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{t("hero.title")}</h1>

          <p className="mb-10 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{t("hero.subtitle")}</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                {t("hero.register")}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/services">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {t("hero.find")}
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">5000+</div>
              <div className="text-sm text-gray-600">{t("hero.stats.businesses")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">48</div>
              <div className="text-sm text-gray-600">{t("hero.stats.wilayas")}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-emerald-600">4.9</span>
                <Star className="h-6 w-6 text-yellow-400 fill-current ml-1" />
              </div>
              <div className="text-sm text-gray-600">{t("hero.stats.rating")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
