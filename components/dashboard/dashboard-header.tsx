"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { 
  Menu, 
  User, 
  LogOut, 
  Settings,
  Bell
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
  onMenuClick: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const { t, language, setLanguage } = useLanguage()
  const [notifications] = useState(0) // Placeholder pour les notifications
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return t('dashboard.title')
      case '/dashboard/businesses':
        return t('dashboard.myBusinesses.title')
      case '/dashboard/create-business':
        return 'Nouvelle Entreprise'
      case '/dashboard/profile':
        return t('dashboard.profile.title')
      case '/dashboard/settings':
        return t('dashboard.settings.title')
      case '/admin':
        return t('dashboard.admin.title')
      default:
        // Gestion des routes dynamiques
        if (pathname.startsWith('/dashboard/create-business')) {
          return 'Nouvelle Entreprise'
        }
        if (pathname.startsWith('/dashboard/businesses')) {
          return t('dashboard.myBusinesses.title')
        }
        if (pathname.startsWith('/dashboard')) {
          return t('dashboard.title')
        }
        return t('dashboard.title')
    }
  }

  return (
    <header className="fixed top-4 left-4 right-4 lg:left-72 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-900/5">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Side - Menu & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-gray-100 rounded-xl"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo/Brand - Hidden on desktop since it's in sidebar */}
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/25">
                <span className="text-white font-bold text-sm">Dz</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
            </div>

            {/* Page Title - Visible on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Side - Actions & Profile */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-3 py-2"
            >
              <span className="text-sm font-medium">
                {language === 'fr' ? 'العربية' : 'Français'}
              </span>
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-gray-100 rounded-xl p-2"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow-sm">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 hover:bg-gray-100 rounded-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mr-4 mt-2 rounded-2xl border-0 shadow-xl shadow-gray-900/10 bg-white/95 backdrop-blur-sm" align="end" forceMount>
                <div className="flex flex-col space-y-2 p-4">
                  <p className="text-sm font-semibold leading-none text-gray-900">
                    {user.name || t('dashboard.user')}
                  </p>
                  <p className="text-xs leading-none text-gray-500">
                    {user.email}
                  </p>
                  {user.role && (
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-xs font-medium w-fit mt-2">
                      {user.role}
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-gray-200/50" />
                <DropdownMenuItem className="mx-2 mb-2 rounded-xl hover:bg-gray-100 focus:bg-gray-100">
                  <Settings className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{t('dashboard.profile.title')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200/50" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="mx-2 mb-2 rounded-xl hover:bg-red-50 focus:bg-red-50 text-red-600"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
} 