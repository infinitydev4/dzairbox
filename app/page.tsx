import type { Metadata } from "next"
import localFont from "next/font/local"
import { HomeExperience } from "@/components/home/home-experience"
import fr from "@/locales/fr.json"
import "./home.css"

const displayFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-home-display",
  display: "swap",
})

const description = "Trouvez des services locaux en Algérie et découvrez les pages des professionnels. Avec DzairBox, cherchez un métier, une entreprise ou un lieu et créez votre page business."

export const metadata: Metadata = {
  title: { absolute: "DzairBox | Trouver un service local en Algérie" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "DzairBox | Trouver un service local en Algérie",
    description,
    url: "/",
    siteName: "DzairBox",
    locale: "fr_DZ",
    images: [{ url: "/images/home/dzairbox-local-life-og.webp", width: 1200, height: 630, alt: "DzairBox — scène illustrative de la vie locale en Algérie" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "DzairBox | Trouver un service local en Algérie", description, images: ["/images/home/dzairbox-local-life-og.webp"] },
}

const faqItems = ([1, 2, 3, 4] as const).map((number) => ({
  "@type": "Question",
  name: fr.home.faq[`q${number}`],
  acceptedAnswer: {
    "@type": "Answer",
    text: fr.home.faq[`a${number}`],
  },
}))

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DzairBox",
    url: "https://dzairbox.com/",
    description,
    inLanguage: ["fr-DZ", "ar-DZ"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://dzairbox.com/businesses?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  },
]

export default function HomePage() {
  return (
    <div className={displayFont.variable}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <HomeExperience />
    </div>
  )
}
