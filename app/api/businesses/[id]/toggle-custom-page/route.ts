import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDefaultConfig } from "@/types/template"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

export async function POST(
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

    const { enabled, templateKey } = await req.json()

    // Vérifier que l'utilisateur est propriétaire
    const business = await prisma.business.findUnique({
      where: { id: params.id, userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json(
        { error: "Entreprise non trouvée ou non autorisée" },
        { status: 404 }
      )
    }

    // Si on active le système de templates
    if (enabled) {
      // Trouver le template demandé ou utiliser sidebar-right par défaut
      const templateKeyToUse = templateKey || "sidebar-right"
      const template = await prisma.template.findUnique({
        where: { key: templateKeyToUse }
      })

      if (!template) {
        return NextResponse.json(
          { error: "Template non trouvé" },
          { status: 404 }
        )
      }

      // Créer une config par défaut si elle n'existe pas
      const existingConfig = await prisma.businessPageConfig.findUnique({
        where: { businessId: params.id }
      })

      if (!existingConfig) {
        const defaultConfig = getDefaultConfig(templateKeyToUse as any)
        
        await prisma.businessPageConfig.create({
          data: {
            businessId: params.id,
            config: defaultConfig as any,
            configVersion: 1
          }
        })
      }

      // Activer useCustomPage et associer le template
      await prisma.business.update({
        where: { id: params.id },
        data: { 
          useCustomPage: true,
          templateId: template.id
        }
      })

      // Revalider le cache
      revalidatePath(`/${business.subdomain}`)
      revalidatePath(`/business/${business.subdomain}`)

      return NextResponse.json({ 
        success: true, 
        enabled: true,
        templateKey: templateKeyToUse
      })
    } else {
      // Désactiver le système de templates
      await prisma.business.update({
        where: { id: params.id },
        data: { useCustomPage: false }
      })

      // Revalider le cache
      revalidatePath(`/${business.subdomain}`)
      revalidatePath(`/business/${business.subdomain}`)

      return NextResponse.json({ 
        success: true, 
        enabled: false
      })
    }

  } catch (error) {
    console.error("Error toggling custom page:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'activation/désactivation" },
      { status: 500 }
    )
  }
}

