import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSignedImageUrl } from "@/lib/s3"

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        facebook: true,
        instagram: true,
        tiktok: true,
        youtube: true,
        heroImage: true,
        subdomain: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Générer les URLs pré-signées pour les heroImages S3
    const businessesWithSignedUrls = await Promise.all(
      businesses.map(async (business) => {
        if (business.heroImage && business.heroImage.includes('s3.amazonaws.com')) {
          // Si c'est une URL S3, générer une URL pré-signée
          try {
            const signedUrl = await getSignedImageUrl(business.heroImage)
            return { ...business, heroImage: signedUrl }
          } catch (error) {
            console.error('Erreur génération URL pré-signée:', error)
            return business // Retourner l'URL originale en cas d'erreur
          }
        }
        return business
      })
    )

    return NextResponse.json(businessesWithSignedUrls)
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json([], { status: 500 })
  }
} 