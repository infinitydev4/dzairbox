import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BusinessPage } from "@/components/business/business-page"
import { getServerTranslation } from "@/lib/translations"
import type { Metadata } from "next"

interface BusinessPageProps {
  params: {
    subdomain: string
  }
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const t = getServerTranslation('fr') // Vous pourriez récupérer la langue depuis les cookies/headers
  
  const business = await prisma.business.findUnique({
    where: {
      subdomain: params.subdomain,
      isActive: true
    }
  })

  if (!business) {
    return {
      title: t('business.meta.notFoundTitle')
    }
  }

  return {
    title: `${business.name} - ${business.category} | DzBusiness`,
    description: business.description || `${t('business.meta.discover')} ${business.name}, spécialisé en ${business.category} à ${business.address}`,
    keywords: `${business.name}, ${business.category}, ${business.address}, Algérie, DzBusiness`,
    openGraph: {
      title: business.name,
      description: business.description || `${t('business.meta.discover')} ${business.name}`,
      type: "website",
      url: `https://${business.subdomain}.dzbusiness.dz`,
    },
  }
}

export default async function BusinessPageRoute({ params }: BusinessPageProps) {
  const business = await prisma.business.findUnique({
    where: {
      subdomain: params.subdomain,
      isActive: true
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

  if (!business) {
    notFound()
  }

  return <BusinessPage business={business} />
} 