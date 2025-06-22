import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const businessData = await req.json()
    
    console.log("Données reçues pour création d'entreprise:", businessData)
    console.log("Session utilisateur:", { id: session.user.id, email: session.user.email })

    // Validation des données obligatoires
    const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
    const missingFields = requiredFields.filter(field => {
      const value = businessData[field]
      if (!value) return true
      
      // Gestion spéciale pour les objets (comme hours)
      if (typeof value === 'object') {
        return Object.keys(value).length === 0
      }
      
      // Pour les strings
      return String(value).trim() === ""
    })

    if (missingFields.length > 0) {
      console.log("Champs manquants:", missingFields)
      return NextResponse.json(
        { error: `Champs obligatoires manquants: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    // Générer un sous-domaine unique basé sur le nom de l'entreprise
    const subdomain = await generateUniqueSubdomain(businessData.name)

    // Convertir les horaires en string si c'est un objet
    let hoursString = businessData.hours
    if (typeof businessData.hours === 'object' && businessData.hours !== null) {
      // Convertir l'objet en format lisible
      hoursString = Object.entries(businessData.hours)
        .map(([day, time]) => `${day}: ${time}`)
        .join(', ')
    }

    // Créer l'entreprise en base de données
    console.log("Création de l'entreprise avec le sous-domaine:", subdomain)
    console.log("Horaires converties:", hoursString)
    
    const business = await prisma.business.create({
      data: {
        name: businessData.name,
        description: businessData.description,
        category: businessData.category,
        address: businessData.address,
        phone: businessData.phone,
        email: businessData.email || null,
        website: businessData.website || null,
        hours: hoursString,
        services: Array.isArray(businessData.services) 
          ? businessData.services.join(", ") 
          : businessData.services || null,
        subdomain: subdomain,
        isActive: false, // Nécessite validation admin
        userId: session.user.id,
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

    console.log("Entreprise créée avec succès:", business.id)

    return NextResponse.json({
      id: business.id,
      name: business.name,
      subdomain: business.subdomain,
      isActive: business.isActive,
      message: "Entreprise créée avec succès ! Elle sera activée après validation par nos équipes."
    })

  } catch (error) {
    console.error("Error creating business:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entreprise" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Récupérer les entreprises de l'utilisateur
    const businesses = await prisma.business.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(businesses)

  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises" },
      { status: 500 }
    )
  }
}

// Fonction pour générer un sous-domaine unique
async function generateUniqueSubdomain(businessName: string): Promise<string> {
  // Nettoyer le nom pour créer un sous-domaine valide
  let baseSubdomain = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Garder uniquement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, "-") // Remplacer espaces par tirets
    .replace(/-+/g, "-") // Éviter les tirets multiples
    .replace(/^-|-$/g, "") // Supprimer tirets en début/fin
    .substring(0, 30) // Limiter la longueur

  // Si le nom est vide après nettoyage, utiliser un nom par défaut
  if (!baseSubdomain) {
    baseSubdomain = "business"
  }

  let subdomain = baseSubdomain
  let counter = 1

  // Vérifier l'unicité et ajouter un numéro si nécessaire
  while (true) {
    const existing = await prisma.business.findUnique({
      where: { subdomain }
    })

    if (!existing) {
      break
    }

    subdomain = `${baseSubdomain}-${counter}`
    counter++
  }

  return subdomain
} 