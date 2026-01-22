"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Zap,
  Wrench,
  Cross,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Scissors,
  Hammer,
  Car,
  Home,
  Stethoscope,
  GraduationCap,
  ArrowRight,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ServicesSection() {
  const { t } = useLanguage()
  const router = useRouter()

  const services = [
    { icon: UtensilsCrossed, name: "Restaurant", translationKey: "services.restaurant", count: "367+", color: "text-purple-600 bg-purple-100", gradient: "from-purple-500 to-purple-600" },
    { icon: Coffee, name: "Café", translationKey: "services.bakery", count: "298+", color: "text-orange-600 bg-orange-100", gradient: "from-orange-500 to-orange-600" },
    { icon: Wrench, name: "Garage", translationKey: "services.mechanic", count: "189+", color: "text-blue-600 bg-blue-100", gradient: "from-blue-500 to-blue-600" },
    { icon: Cross, name: "Pharmacie", translationKey: "services.pharmacy", count: "156+", color: "text-red-600 bg-red-100", gradient: "from-red-500 to-red-600" },
    { icon: Stethoscope, name: "Clinique", translationKey: "services.doctor", count: "234+", color: "text-emerald-600 bg-emerald-100", gradient: "from-emerald-500 to-emerald-600" },
    { icon: Scissors, name: "Salon de beauté", translationKey: "services.hairdresser", count: "134+", color: "text-pink-600 bg-pink-100", gradient: "from-pink-500 to-pink-600" },
    { icon: Car, name: "Auto-école", translationKey: "services.drivingSchool", count: "89+", color: "text-indigo-600 bg-indigo-100", gradient: "from-indigo-500 to-indigo-600" },
    { icon: GraduationCap, name: "Formation", translationKey: "services.school", count: "145+", color: "text-violet-600 bg-violet-100", gradient: "from-violet-500 to-violet-600" },
    { icon: Home, name: "Hôtel", translationKey: "services.realEstate", count: "178+", color: "text-teal-600 bg-teal-100", gradient: "from-teal-500 to-teal-600" },
    { icon: Hammer, name: "Artisanat", translationKey: "services.craftsman", count: "267+", color: "text-gray-600 bg-gray-100", gradient: "from-gray-500 to-gray-600" },
    { icon: Zap, name: "Entretien", translationKey: "services.electrician", count: "245+", color: "text-yellow-600 bg-yellow-100", gradient: "from-yellow-500 to-yellow-600" },
    { icon: ShoppingCart, name: "Librairie", translationKey: "services.grocery", count: "423+", color: "text-green-600 bg-green-100", gradient: "from-green-500 to-green-600" },
  ]

  const handleCategoryClick = (categoryName: string) => {
    // Naviguer vers /businesses avec le filtre de catégorie
    router.push(`/businesses?category=${encodeURIComponent(categoryName)}`)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            {t("services.exploreByCategory")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("services.title")}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-12">
          {services.map((service, index) => (
            <Card
              key={index}
              onClick={() => handleCategoryClick(service.name)}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <CardContent className="p-6 text-center relative">
                <div
                  className={`inline-flex p-4 rounded-2xl ${service.color} mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}
                >
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-3">{service.count}</p>
                
                {/* Arrow on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="h-4 w-4 text-emerald-600 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to view all businesses */}
        <div className="text-center">
          <Link href="/businesses">
            <Card className="inline-block hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 group">
              <CardContent className="p-6 px-8">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-emerald-700 group-hover:text-emerald-800">
                    {t("services.viewAll")}
                  </span>
                  <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  )
}
