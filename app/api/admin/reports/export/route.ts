import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'full'

    let csvContent = ''
    let filename = 'dzbusiness-export.csv'

    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({
          include: {
            _count: {
              select: {
                businesses: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        csvContent = 'ID,Nom,Email,Rôle,Date d\'inscription,Nombre d\'entreprises\n'
        csvContent += users.map(user => 
          `${user.id},"${user.name || 'N/A'}","${user.email}","${user.role}","${user.createdAt.toISOString().split('T')[0]}",${user._count.businesses}`
        ).join('\n')
        
        filename = 'dzbusiness-users.csv'
        break

      case 'businesses':
        const businesses = await prisma.business.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        csvContent = 'ID,Nom,Catégorie,Description,Adresse,Téléphone,Email,Site web,Sous-domaine,Statut,Date création,Propriétaire,Email propriétaire\n'
        csvContent += businesses.map(business => 
          `${business.id},"${business.name}","${business.category}","${business.description || ''}","${business.address}","${business.phone || ''}","${business.email || ''}","${business.website || ''}","${business.subdomain}","${business.isActive ? 'Active' : 'En attente'}","${business.createdAt.toISOString().split('T')[0]}","${business.user.name || 'N/A'}","${business.user.email}"`
        ).join('\n')
        
        filename = 'dzbusiness-entreprises.csv'
        break

      case 'full':
        // Rapport complet avec statistiques
        const [totalUsers, totalBusinesses, activeBusinesses, pendingBusinesses] = await Promise.all([
          prisma.user.count(),
          prisma.business.count(),
          prisma.business.count({ where: { isActive: true } }),
          prisma.business.count({ where: { isActive: false } })
        ])

        csvContent = 'Statistiques DzBusiness\n'
        csvContent += 'Métrique,Valeur\n'
        csvContent += `Utilisateurs total,${totalUsers}\n`
        csvContent += `Entreprises total,${totalBusinesses}\n`
        csvContent += `Entreprises actives,${activeBusinesses}\n`
        csvContent += `Entreprises en attente,${pendingBusinesses}\n`
        csvContent += `Taux d'approbation,${totalBusinesses > 0 ? Math.round((activeBusinesses / totalBusinesses) * 100) : 0}%\n`
        
        filename = 'dzbusiness-rapport-complet.csv'
        break

      default:
        return NextResponse.json(
          { error: "Type d'export invalide" },
          { status: 400 }
        )
    }

    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    return response

  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    )
  }
} 