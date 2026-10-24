import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || (session.user.role !== "ADMIN" || !session.user.emailVerified)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const businesses = await prisma.business.findMany({
      include: {
        pageConfig: { select: { submitted: true } },
        user: {
          select: {
            name: true,
            email: true,
            emailVerified: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(businesses)

  } catch (error) {
    console.error("Error fetching businesses for admin:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises" },
      { status: 500 }
    )
  }
} 