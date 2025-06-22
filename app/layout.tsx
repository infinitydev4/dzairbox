import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
})

export const metadata: Metadata = {
  title: "DzBusiness - Services Locaux en Algérie",
  description:
    "Trouvez et référencez vos services locaux en Algérie. Électriciens, mécaniciens, pharmacies, épiceries et plus encore.",
  keywords:
    "services locaux Algérie, entreprises algériennes, électricien, mécanicien, pharmacie, épicerie, boulangerie",
  authors: [{ name: "DzBusiness" }],
  creator: "DzBusiness",
  publisher: "DzBusiness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dzbusiness.dz"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-DZ": "/fr",
      "ar-DZ": "/ar",
    },
  },
  openGraph: {
    title: "DzBusiness - Services Locaux en Algérie",
    description: "Plateforme de référencement pour les services locaux en Algérie",
    url: "https://dzbusiness.dz",
    siteName: "DzBusiness",
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DzBusiness - Services Locaux en Algérie",
    description: "Plateforme de référencement pour les services locaux en Algérie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DzBusiness" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} ${notoSansArabic.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
