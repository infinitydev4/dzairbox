"use client"

import { Search, Smartphone, TrendingUp, Shield, Clock, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Search,
      title: t("features.seo.title"),
      description: t("features.seo.description"),
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: Smartphone,
      title: t("features.mobile.title"),
      description: t("features.mobile.description"),
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      icon: TrendingUp,
      title: t("features.visibility.title"),
      description: t("features.visibility.description"),
      color: "text-purple-600 bg-purple-100",
    },
    {
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
      color: "text-red-600 bg-red-100",
    },
    {
      icon: Clock,
      title: t("features.speed.title"),
      description: t("features.speed.description"),
      color: "text-orange-600 bg-orange-100",
    },
    {
      icon: MapPin,
      title: t("features.location.title"),
      description: t("features.location.description"),
      color: "text-green-600 bg-green-100",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("features.title")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-200"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
