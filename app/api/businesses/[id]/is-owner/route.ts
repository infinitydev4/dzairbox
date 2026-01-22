import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ isOwner: false })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!business) {
      return NextResponse.json({ isOwner: false })
    }

    const isOwner = business.userId === session.user.id

    return NextResponse.json({ isOwner })
  } catch (error) {
    console.error("Error checking ownership:", error)
    return NextResponse.json({ isOwner: false })
  }
}

