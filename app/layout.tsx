import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
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
  title: {
    default: "DzairBox | Services locaux en Algérie",
    template: "%s | DzairBox",
  },
  description:
    "Trouvez des services locaux en Algérie et découvrez les pages des professionnels sur DzairBox.",
  keywords:
    "DzairBox, services locaux Algérie, professionnels, annuaire, page business",
  authors: [{ name: "DzairBox" }],
  creator: "DzairBox",
  publisher: "DzairBox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dzairbox.com"),
  openGraph: {
    title: "DzairBox | Services locaux en Algérie",
    description: "Trouvez des services locaux en Algérie et découvrez les pages des professionnels.",
    url: "https://dzairbox.com",
    siteName: "DzairBox",
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DzairBox | Services locaux en Algérie",
    description: "Trouvez des services locaux en Algérie et découvrez les pages des professionnels.",
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
}

export const viewport: Viewport = {
  themeColor: "#103832",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
