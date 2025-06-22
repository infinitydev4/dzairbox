"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Menu, 
  X, 
  Shield, 
  User, 
  LogOut, 
  Settings,
  Bell,
  Home
} from "lucide-react"
import Link from "next/link"

interface AdminHeaderProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function AdminHeader({ onToggleSidebar, sidebarOpen }: AdminHeaderProps) {
  const { data: session } = useSession()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">DzBusiness Admin</h1>
                <p className="text-xs text-gray-500">Panneau d'administration</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Home button */}
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Site principal</span>
            </Link>
          </Button>

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">3 nouvelles entreprises en attente</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Nouveau utilisateur inscrit</p>
                  <p className="text-xs text-gray-500">Il y a 4 heures</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Rapport mensuel disponible</p>
                  <p className="text-xs text-gray-500">Il y a 1 jour</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                <span className="text-sm text-emerald-600">Voir toutes les notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <div className="bg-emerald-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || "Administrateur"}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Site principal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 