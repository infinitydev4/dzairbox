import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PublicBusinessPage } from "@/components/business/public-business-page"
import type { Metadata } from "next"
import { BusinessPageConfigData } from "@/types/template"

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
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        pageConfig: true,
        template: true
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
      title: "Service non trouvé - Dzairbox"
    }
  }

  // Extract title and description from config if custom page is enabled
  let title = business.name
  let description = business.description || `Découvrez ${business.name}, ${business.category} situé à ${business.address}.`
  
  if (business.useCustomPage && business.pageConfig) {
    const config = business.pageConfig.config as unknown as BusinessPageConfigData
    if (config.hero?.title) {
      title = config.hero.title
    }
    if (config.hero?.description) {
      description = config.hero.description
    }
  }

  return {
    title: `${title} - ${business.category} | Dzairbox`,
    description: description,
    keywords: `${business.name}, ${business.category}, ${business.address}, Algérie, Dzairbox`,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      locale: "fr_FR",
    }
  }
}

export const revalidate = 3600 // ISR: revalidate every hour

export default async function BusinessPageRoute({ params }: BusinessPageProps) {
  const business = await getBusiness(params.subdomain)

  if (!business) {
    notFound()
  }

  // Préparer la configuration si la page custom est activée
  let config: BusinessPageConfigData | undefined = undefined
  let useCustomPage = false

  if (business.useCustomPage && business.pageConfig && business.pageConfig.publishedAt) {
    config = business.pageConfig.config as unknown as BusinessPageConfigData
    useCustomPage = true
  } else if (business.pageConfig && business.pageConfig.draft) {
    // Si pas encore publié mais qu'il y a un draft, le passer au composant pour l'édition
    config = business.pageConfig.draft as unknown as BusinessPageConfigData
  }

  return (
    <PublicBusinessPage 
      business={business as any} 
      useCustomPage={useCustomPage}
      config={config}
    />
  )
} 