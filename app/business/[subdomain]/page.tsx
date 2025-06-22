import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BusinessPage } from "@/components/business/business-page"
import type { Metadata } from "next"

interface BusinessPageProps {
  params: {
    subdomain: string
  }
}

async function getBusiness(subdomain: string) {
  try {
    const business = await prisma.business.findUnique({
      where: {
        subdomain: subdomain,
        isActive: true // Seulement les entreprises actives
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return business
  } catch (error) {
    console.error("Error fetching business:", error)
    return null
  }
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const business = await getBusiness(params.subdomain)
  
  if (!business) {
    return {
      title: "Entreprise non trouvée - DzBusiness"
    }
  }

  return {
    title: `${business.name} - ${business.category} | DzBusiness`,
    description: business.description || `Découvrez ${business.name}, ${business.category} située à ${business.address}. Contactez-nous pour plus d'informations.`,
    keywords: `${business.name}, ${business.category}, ${business.address}, Algérie, DzBusiness`,
    openGraph: {
      title: business.name,
      description: business.description || `${business.category} à ${business.address}`,
      type: "website",
      locale: "fr_FR",
    }
  }
}

export default async function Page({ params }: BusinessPageProps) {
  const business = await getBusiness(params.subdomain)

  if (!business) {
    notFound()
  }

  return <BusinessPage business={business} />
} 