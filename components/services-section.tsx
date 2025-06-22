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
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function ServicesSection() {
  const { t } = useLanguage()

  const services = [
    { icon: Zap, name: t("services.electrician"), count: "245+", color: "text-yellow-600 bg-yellow-100" },
    { icon: Wrench, name: t("services.mechanic"), count: "189+", color: "text-blue-600 bg-blue-100" },
    { icon: Cross, name: t("services.pharmacy"), count: "156+", color: "text-red-600 bg-red-100" },
    { icon: ShoppingCart, name: t("services.grocery"), count: "423+", color: "text-green-600 bg-green-100" },
    { icon: Coffee, name: t("services.bakery"), count: "298+", color: "text-orange-600 bg-orange-100" },
    { icon: UtensilsCrossed, name: t("services.restaurant"), count: "367+", color: "text-purple-600 bg-purple-100" },
    { icon: Scissors, name: t("services.hairdresser"), count: "134+", color: "text-pink-600 bg-pink-100" },
    { icon: Hammer, name: t("services.craftsman"), count: "267+", color: "text-gray-600 bg-gray-100" },
    { icon: Car, name: t("services.drivingSchool"), count: "89+", color: "text-indigo-600 bg-indigo-100" },
    { icon: Home, name: t("services.realEstate"), count: "178+", color: "text-teal-600 bg-teal-100" },
    { icon: Stethoscope, name: t("services.doctor"), count: "234+", color: "text-emerald-600 bg-emerald-100" },
    { icon: GraduationCap, name: t("services.school"), count: "145+", color: "text-violet-600 bg-violet-100" },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("services.title")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex p-3 rounded-xl ${service.color} mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{service.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{service.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
