import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
        website: true,
        subdomain: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json([], { status: 500 })
  }
} 