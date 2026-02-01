import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id // S'assurer que l'utilisateur possède cette entreprise
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    // Parser les images si elles sont stockées en JSON
    let parsedImages = []
    try {
      parsedImages = business.images ? JSON.parse(business.images) : []
      console.log("🔍 Images parsées:", parsedImages)
      console.log("🔍 Raw images from DB:", business.images)
    } catch (error) {
      console.error("Erreur parsing images JSON:", error)
      parsedImages = []
    }

    const businessWithParsedImages = {
      ...business,
      images: parsedImages
    }

    console.log("📤 Réponse API GET business:", {
      id: business.id,
      images: businessWithParsedImages.images,
      heroImage: businessWithParsedImages.heroImage
    })

    return NextResponse.json(businessWithParsedImages)

  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const businessData = await req.json()
    
    console.log("Données reçues pour mise à jour d'entreprise:", businessData)
    console.log("ID entreprise:", params.id)

    // Vérifier que l'entreprise existe et appartient à l'utilisateur
    const existingBusiness = await prisma.business.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Entreprise non trouvée ou non autorisée" },
        { status: 404 }
      )
    }

    // Déterminer si c'est une mise à jour d'images seulement
    const isImageOnlyUpdate = Object.keys(businessData).every(key => 
      ['images', 'heroImage'].includes(key)
    )

    // Validation des données obligatoires seulement pour les mises à jour complètes
    if (!isImageOnlyUpdate) {
      const requiredFields = ["name", "category", "description", "address", "phone"]
      const missingFields = requiredFields.filter(field => {
        const value = businessData[field]
        if (!value) return true
        return String(value).trim() === ""
      })

      if (missingFields.length > 0) {
        console.log("Champs manquants:", missingFields)
        return NextResponse.json(
          { error: `Champs obligatoires manquants: ${missingFields.join(", ")}` },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    let updateData: any = {}

    // Si c'est une mise à jour d'images seulement
    if (isImageOnlyUpdate) {
      // Nettoyer les images avant la sauvegarde
      let cleanImages: string[] = []
      if (Array.isArray(businessData.images)) {
        cleanImages = businessData.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
      }

      updateData = {
        heroImage: businessData.heroImage || null,
        images: cleanImages.length > 0 ? JSON.stringify(cleanImages) : null,
        updatedAt: new Date()
      }
    } else {
      // Mise à jour complète
      // Convertir les horaires en string JSON si c'est un objet
      let hoursString = businessData.hours
      if (typeof businessData.hours === 'object' && businessData.hours !== null) {
        hoursString = JSON.stringify(businessData.hours)
      }

      // Nettoyer les images avant la sauvegarde
      let cleanImages: string[] = []
      if (Array.isArray(businessData.images)) {
        cleanImages = businessData.images.filter((img: any) => img && typeof img === 'string' && img.trim() !== '')
      }

      updateData = {
        name: businessData.name,
        description: businessData.description,
        category: businessData.category,
        address: businessData.address,
        phone: businessData.phone,
        email: businessData.email || null,
        facebook: businessData.facebook || null,
        instagram: businessData.instagram || null,
        tiktok: businessData.tiktok || null,
        youtube: businessData.youtube || null,
        hours: hoursString,
        services: Array.isArray(businessData.services) 
          ? businessData.services.join(", ") 
          : businessData.services || null,
        heroImage: businessData.heroImage || null,
        images: cleanImages.length > 0 ? JSON.stringify(cleanImages) : null,
        updatedAt: new Date()
      }
    }

    // Mettre à jour l'entreprise
    const updatedBusiness = await prisma.business.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log("Entreprise mise à jour avec succès:", updatedBusiness.id)

    return NextResponse.json({
      id: updatedBusiness.id,
      name: updatedBusiness.name,
      subdomain: updatedBusiness.subdomain,
      isActive: updatedBusiness.isActive,
      message: isImageOnlyUpdate ? "Images mises à jour avec succès !" : "Entreprise mise à jour avec succès !"
    })

  } catch (error) {
    console.error("Error updating business:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'entreprise" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier que l'entreprise existe et appartient à l'utilisateur
    const existingBusiness = await prisma.business.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Entreprise non trouvée ou non autorisée" },
        { status: 404 }
      )
    }

    // Supprimer l'entreprise
    await prisma.business.delete({
      where: { id: params.id }
    })

    console.log("Entreprise supprimée avec succès:", params.id)

    return NextResponse.json({
      message: "Entreprise supprimée avec succès !"
    })

  } catch (error) {
    console.error("Error deleting business:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entreprise" },
      { status: 500 }
    )
  }
} 