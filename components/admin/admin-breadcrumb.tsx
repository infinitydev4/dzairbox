"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/businesses": "Entreprises",
  "/admin/users": "Utilisateurs", 
  "/admin/reports": "Rapports",
  "/admin/settings": "Paramètres",
  "/admin/help": "Aide"
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Ne pas afficher le breadcrumb sur la page d'accueil admin
  if (pathname === "/admin") {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/")
    const name = breadcrumbMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    return {
      name,
      href: path,
      isLast: index === pathSegments.length - 1
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        href="/admin" 
        className="flex items-center hover:text-emerald-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {breadcrumb.isLast ? (
            <span className="font-medium text-gray-900">
              {breadcrumb.name}
            </span>
          ) : (
            <Link 
              href={breadcrumb.href}
              className="hover:text-emerald-600 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
} 