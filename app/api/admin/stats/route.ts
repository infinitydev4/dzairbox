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

    // Calculer les dates pour les statistiques
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Statistiques des utilisateurs
    const [totalUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ])

    // Statistiques des entreprises
    const [
      totalBusinesses,
      activeBusinesses,
      pendingBusinesses,
      rejectedBusinesses
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({
        where: { isActive: true }
      }),
      prisma.business.count({
        where: { isActive: false }
      }),
      // Pour l'instant, pas de système de rejet, donc 0
      Promise.resolve(0)
    ])

    // Statistiques des abonnements (à implémenter selon vos besoins)
    const totalSubscriptions = 0
    const activeSubscriptions = 0
    const expiredSubscriptions = 0

    const stats = {
      users: {
        total: totalUsers,
        active: totalUsers, // Tous les utilisateurs sont considérés actifs pour l'instant
        newThisMonth: newUsersThisMonth
      },
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        pending: pendingBusinesses,
        rejected: rejectedBusinesses
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
} 