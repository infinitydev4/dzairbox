import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateConfigStrict } from "@/lib/template-validator"
import { revalidatePath } from "next/cache"

// Force dynamic rendering
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

    const pageConfig = await prisma.businessPageConfig.findUnique({
      where: { businessId: params.id }
    })

    if (!pageConfig) {
      return NextResponse.json({ 
        config: null, 
        draft: null,
        hasConfig: false
      })
    }

    return NextResponse.json({
      config: pageConfig.config,
      draft: pageConfig.draft,
      configVersion: pageConfig.configVersion,
      publishedAt: pageConfig.publishedAt,
      hasConfig: true
    })

  } catch (error) {
    console.error("Error fetching page config:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la configuration" },
      { status: 500 }
    )
  }
}

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

    // Vérifier que l'utilisateur est propriétaire
    const business = await prisma.business.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { template: true }
    })

    if (!business) {
      return NextResponse.json(
        { error: "Entreprise non trouvée ou non autorisée" },
        { status: 404 }
      )
    }

    const { config, publish } = await req.json()
    
    console.log('📝 Config reçue:', JSON.stringify(config, null, 2))
    console.log('📝 Publish:', publish)
    
    // Validation stricte du JSON selon le schema
    const validation = validateConfigStrict(config)
    
    if (!validation.success) {
      console.error('❌ Validation échouée:', JSON.stringify(validation.error.format(), null, 2))
      return NextResponse.json(
        { 
          error: "Configuration invalide", 
          details: validation.error.format()
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Validation réussie')
    console.log('📋 Business templateId actuel:', business.templateId)
    console.log('📋 Business template.key actuel:', business.template?.key)
    console.log('📋 Config templateKey demandé:', config.templateKey)

    // Si le template change, mettre à jour le templateId du business
    if (config.templateKey !== business.template?.key) {
      console.log(`🔄 Changement de template: ${business.template?.key || 'aucun'} → ${config.templateKey}`)
      
      const newTemplate = await prisma.template.findUnique({
        where: { key: config.templateKey }
      })
      
      if (newTemplate) {
        await prisma.business.update({
          where: { id: params.id },
          data: { templateId: newTemplate.id }
        })
        console.log('✅ Template du business mis à jour vers:', newTemplate.key)
      } else {
        console.error('❌ Template non trouvé:', config.templateKey)
      }
    }

    const data = publish 
      ? { 
          config: validation.data as any, 
          publishedAt: new Date(),
          configVersion: config.configVersion || 1
        }
      : { 
          draft: validation.data as any,
          configVersion: config.configVersion || 1
        }

    const pageConfig = await prisma.businessPageConfig.upsert({
      where: { businessId: params.id },
      create: { 
        businessId: params.id, 
        config: publish ? (validation.data as any) : {} as any,
        ...data 
      },
      update: data
    })

    // Synchroniser heroImage du Business avec config.hero.backgroundImage
    if (config.hero?.backgroundImage) {
      await prisma.business.update({
        where: { id: params.id },
        data: { heroImage: config.hero.backgroundImage }
      })
      console.log('✅ HeroImage du business synchronisé:', config.hero.backgroundImage)
    } else if (config.hero?.backgroundImage === undefined || config.hero?.backgroundImage === null) {
      // Si l'image hero est supprimée dans la config, supprimer aussi dans business
      await prisma.business.update({
        where: { id: params.id },
        data: { heroImage: null }
      })
      console.log('✅ HeroImage du business supprimé')
    }

    // Revalider le cache de la page publique si published
    if (publish) {
      revalidatePath(`/${business.subdomain}`)
      revalidatePath(`/business/${business.subdomain}`)
      console.log('✅ Cache revalidé pour:', business.subdomain)
    }

    return NextResponse.json({ 
      success: true,
      published: publish,
      configId: pageConfig.id
    })

  } catch (error) {
    console.error("Error saving page config:", error)
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de la configuration" },
      { status: 500 }
    )
  }
}

