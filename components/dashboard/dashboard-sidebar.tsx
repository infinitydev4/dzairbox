"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { 
  Home,
  Building2,
  Plus,
  User,
  Settings,
  X,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string
}

export function DashboardSidebar({ isOpen, onClose, userRole }: DashboardSidebarProps) {
  const { t } = useLanguage()
  const pathname = usePathname()

  const navigation = [
    {
      name: t('dashboard.title'),
      href: '/dashboard',
      icon: Home,
    },
    {
      name: t('dashboard.myBusinesses.title'),
      href: '/dashboard/businesses',
      icon: Building2,
    },
    {
      name: t('dashboard.newBusiness.title'),
      href: '/dashboard/create-business',
      icon: Plus,
    },
    {
      name: t('dashboard.profile.title'),
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: t('dashboard.settings.title'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  // Ajouter le lien admin si l'utilisateur est admin
  if (userRole === 'ADMIN') {
    navigation.push({
      name: t('dashboard.admin.title'),
      href: '/admin',
      icon: Shield,
    })
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:top-4 lg:left-4 lg:bottom-4 lg:block lg:w-64 lg:z-40">
        <div className="h-full bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-900/5 overflow-hidden">
          <div className="flex grow flex-col gap-y-5 px-6 pt-6 pb-6 h-full">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/25">
                <span className="text-white font-bold text-sm">Dz</span>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  DzBusiness
                </h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            pathname === item.href
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-r-2 border-emerald-500 shadow-sm'
                              : 'text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50',
                            'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200'
                          )}
                        >
                          <item.icon
                            className={cn(
                              pathname === item.href ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600',
                              'h-5 w-5 shrink-0 transition-colors'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-4 left-4 bottom-4 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl shadow-gray-900/10 overflow-hidden">
          <div className="flex grow flex-col gap-y-5 px-6 pt-6 pb-6 h-full">
            {/* Close Button & Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/25">
                  <span className="text-white font-bold text-sm">Dz</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    DzBusiness
                  </h2>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={onClose} // Fermer la sidebar au clic sur mobile
                          className={cn(
                            pathname === item.href
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-r-2 border-emerald-500 shadow-sm'
                              : 'text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50',
                            'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200'
                          )}
                        >
                          <item.icon
                            className={cn(
                              pathname === item.href ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600',
                              'h-5 w-5 shrink-0 transition-colors'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
} 