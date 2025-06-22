"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    name: "Entreprises",
    href: "/admin/businesses",
    icon: Building2,
    description: "Gestion des entreprises",
    badge: "pending",
    submenu: [
      {
        name: "Toutes les entreprises",
        href: "/admin/businesses",
        icon: Building2
      },
      {
        name: "En attente",
        href: "/admin/businesses?filter=pending",
        icon: Clock
      },
      {
        name: "Actives",
        href: "/admin/businesses?filter=active",
        icon: CheckCircle
      }
    ]
  },
  {
    name: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    description: "Gestion des utilisateurs"
  },
  {
    name: "Rapports",
    href: "/admin/reports",
    icon: BarChart3,
    description: "Statistiques et exports"
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    description: "Configuration"
  },
  {
    name: "Aide",
    href: "/admin/help",
    icon: HelpCircle,
    description: "Documentation"
  }
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // Auto-expand menu if current path matches submenu
  useEffect(() => {
    const currentItem = navigationItems.find(item => 
      item.submenu?.some(sub => sub.href === pathname)
    )
    if (currentItem && !expandedMenus.includes(currentItem.name)) {
      setExpandedMenus([...expandedMenus, currentItem.name])
    }
  }, [pathname])

  const toggleSubmenu = (itemName: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0",
        collapsed && "lg:w-16",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar header with collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && (
              <h2 className="text-sm font-semibold text-gray-900">Navigation</h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
                    isActiveLink(item.href) 
                      ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600" 
                      : "text-gray-700 hover:text-gray-900",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.name)
                    }
                    if (onClose && window.innerWidth < 1024) {
                      onClose()
                    }
                  }}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    collapsed ? "mr-0" : "mr-3"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge === "pending" && (
                        <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                          3
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Submenu */}
                {item.submenu && !collapsed && expandedMenus.includes(item.name) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                          isActiveLink(subItem.href)
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                        onClick={() => {
                          if (onClose && window.innerWidth < 1024) {
                            onClose()
                          }
                        }}
                      >
                        <subItem.icon className="h-4 w-4 mr-3" />
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 p-4">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Attention</p>
                  <p className="text-xs text-gray-500 truncate">
                    3 entreprises en attente
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
} 