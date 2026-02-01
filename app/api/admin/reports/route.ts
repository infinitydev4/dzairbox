import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Dates pour calculs
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Statistiques utilisateurs
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfThisMonth
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth
          }
        }
      })
    ])

    // Statistiques entreprises
    const [
      totalBusinesses,
      activeBusinesses,
      pendingBusinesses,
      businessesThisMonth,
      businessesLastMonth
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({
        where: { isActive: true }
      }),
      prisma.business.count({
        where: { isActive: false }
      }),
      prisma.business.count({
        where: {
          createdAt: {
            gte: startOfThisMonth
          }
        }
      }),
      prisma.business.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth
          }
        }
      })
    ])

    // Calcul des taux de croissance
    const userGrowth = usersLastMonth > 0 ? 
      ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

    const businessGrowth = businessesLastMonth > 0 ? 
      ((businessesThisMonth - businessesLastMonth) / businessesLastMonth) * 100 : 0

    // Données mensuelles pour les 6 derniers mois
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [monthUsers, monthBusinesses] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.business.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ])

      monthly.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        users: monthUsers,
        businesses: monthBusinesses
      })
    }

    const reportData = {
      users: {
        total: totalUsers,
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        growth: Math.round(userGrowth)
      },
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        pending: pendingBusinesses,
        thisMonth: businessesThisMonth,
        lastMonth: businessesLastMonth,
        growth: Math.round(businessGrowth)
      },
      monthly
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    )
  }
} 