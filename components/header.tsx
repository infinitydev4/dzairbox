"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, User } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/logo-dzairbox.png" 
            alt="DzairBox" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            {t("nav.home")}
          </Link>
          <Link href="/businesses" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            {t("nav.directory")}
          </Link>
          {/* <Link href="/services" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            {t("nav.services")}
          </Link> */}
          {/* <Link href="/about" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            {t("nav.about")}
          </Link> */}
          <Link href="/contact" className="text-sm font-medium hover:text-emerald-600 transition-colors">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4" />
                <span className="ml-2 text-sm">{language.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ar")}>العربية</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication Section */}
          {status === "loading" ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <User className="h-4 w-4" />
                  <span className="ml-2 text-sm">{session.user?.name || session.user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{t("nav.dashboard")}</Link>
                </DropdownMenuItem>
                {session.user?.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t("dashboard.admin.title")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            <Link
              href="/"
              className="block text-sm font-medium hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/businesses"
              className="block text-sm font-medium hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.directory")}
            </Link>
            <Link
              href="/services"
              className="block text-sm font-medium hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.services")}
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/contact"
              className="block text-sm font-medium hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.contact")}
            </Link>
            
            {/* Mobile Authentication */}
            {session ? (
              <div className="space-y-2 border-t pt-4">
                <Link
                  href="/dashboard"
                  className="block text-sm font-medium hover:text-emerald-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.dashboard")}
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block text-sm font-medium hover:text-emerald-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("dashboard.admin.title")}
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/auth/signin">{t("nav.login")}</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="w-full" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/auth/signup">{t("nav.register")}</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
