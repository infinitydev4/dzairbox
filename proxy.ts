import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Routes administrateur
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Routes utilisateur protégées
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Les fichiers statiques sont servis à la racine de public/ et par les routes metadata de Next.
        if (/\.(?:svg|png|jpe?g|webp|gif|ico|webmanifest|json)$/i.test(pathname)) {
          return true
        }

        // Les pages /[subdomain] des activités actives sont publiques.
        // Les espaces privés restent soumis au contrôle d’authentification.
        if (/^\/[^/]+\/?$/.test(pathname) &&
            !pathname.startsWith("/admin") &&
            !pathname.startsWith("/dashboard")) {
          return true
        }

        // Routes publiques
        if (pathname === "/" ||
            pathname.startsWith("/auth/") ||
            pathname.startsWith("/api/auth/") ||
            pathname.startsWith("/api/businesses-public") ||
            pathname.startsWith("/api/business/") ||
            pathname.startsWith("/api/contact") ||
            pathname.startsWith("/api/images/proxy") ||
            pathname.startsWith("/register") ||
            pathname.startsWith("/onboarding") ||
            pathname.startsWith("/create-service") ||
            pathname.startsWith("/businesses") ||
            pathname.startsWith("/business") ||
            pathname.startsWith("/about") ||
            pathname.startsWith("/services") ||
            pathname.startsWith("/contact") ||
            pathname.startsWith("/_next/") ||
            pathname.startsWith("/public/")) {
          return true
        }

        // Routes protégées nécessitent une authentification
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
