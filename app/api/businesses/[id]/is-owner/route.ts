import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    console.log('=== IS-OWNER CHECK ===')
    console.log('Business ID:', params.id)
    console.log('Session user:', session?.user)

    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ isOwner: false })
    }

    const business = await prisma.business.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!business) {
      console.log('Business not found')
      return NextResponse.json({ isOwner: false })
    }

    const isOwner = business.userId === session.user.id
    console.log('Business userId:', business.userId)
    console.log('Is owner:', isOwner)

    return NextResponse.json({ isOwner })
  } catch (error) {
    console.error("Error checking ownership:", error)
    return NextResponse.json({ isOwner: false })
  }
}

