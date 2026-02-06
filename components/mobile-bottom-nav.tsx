"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/language-provider"
import { 
  Home, 
  Search, 
  PlusCircle, 
  User,
  Building2
} from "lucide-react"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLanguage()
  
  const createServiceUrl = session ? '/dashboard/create-business' : '/create-service'

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: t("nav.home"),
      active: pathname === "/"
    },
    {
      href: "/businesses",
      icon: Search,
      label: t("nav.directory"),
      active: pathname === "/businesses"
    },
    {
      href: createServiceUrl,
      icon: PlusCircle,
      label: t("mobileNav.create"),
      active: pathname === "/create-service" || pathname === "/dashboard/create-business",
      highlight: true
    },
    {
      href: session ? "/dashboard" : "/auth/signin",
      icon: session ? Building2 : User,
      label: session ? t("nav.dashboard") : t("nav.login"),
      active: pathname.startsWith("/dashboard") || pathname.startsWith("/auth")
    }
  ]

  // Ne pas afficher la bottom nav sur certaines pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/register")) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 px-4 py-2 rounded-xl ${
                item.active 
                  ? item.highlight
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg scale-105'
                    : 'text-emerald-600 bg-emerald-50'
                  : item.highlight
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md hover:shadow-lg'
                    : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${item.active && !item.highlight ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
