import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { businessSlug, onboardingSchema } from "@/lib/service-onboarding"
import { locationLabel, validateLocation, publicLocation } from "@/lib/locations"
import { normalizeSearchText } from "@/lib/search-normalization"
import { sendOnboardingVerification } from "@/lib/onboarding-email"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const parsed = onboardingSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ code: "INVALID_DATA" }, { status: 400 })
    const { requestId, account, business, contact, language } = parsed.data
    if (!session?.user?.id && !account) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 })
    if (!validateLocation(contact.location)) return NextResponse.json({ code: "INVALID_LOCATION" }, { status: 400 })
    const requiresVerification = !session?.user?.id

    // A stable request id makes retries safe if the response was lost after commit.
    const previous = await prisma.business.findUnique({ where: { id: requestId }, include: { user: true } })
    if (previous) {
      const ownsPrevious = session?.user?.id ? previous.userId === session.user.id : account && previous.user?.email === account.email && await bcrypt.compare(account.password, previous.user.password)
      if (!ownsPrevious) return NextResponse.json({ code: "INVALID_DATA" }, { status: 409 })
      return NextResponse.json({ business: { id: previous.id, subdomain: previous.subdomain }, studioUrl: `/dashboard/businesses/${previous.id}/studio`, requiresVerification, verificationEmailSent: false })
    }
    if (requiresVerification && account && await prisma.user.findUnique({ where: { email: account.email } })) {
      return NextResponse.json({ code: "EMAIL_EXISTS" }, { status: 409 })
    }
    const slug = businessSlug(business.name)
    const existingSlug = await prisma.business.findUnique({ where: { subdomain: slug }, select: { id: true } })
    const subdomain = existingSlug ? `${slug}-${crypto.randomBytes(3).toString("hex")}` : slug
    const passwordHash = requiresVerification && account ? await bcrypt.hash(account.password, 12) : undefined
    const verificationToken = crypto.randomBytes(32).toString("hex")

    const created = await prisma.$transaction(async tx => {
      let userId = session?.user?.id
      if (!userId && account && passwordHash) {
        const user = await tx.user.create({ data: { name: account.name, email: account.email, password: passwordHash, emailVerified: null } })
        userId = user.id
        await tx.verificationToken.create({ data: { identifier: account.email, token: verificationToken, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      }
      return tx.business.create({
        data: {
          id: requestId, userId, name: business.name, category: business.category,
          address: locationLabel(contact.location), phone: contact.phone,
          location: publicLocation(contact.location) as unknown as Prisma.InputJsonValue,
          wilayaCode: contact.location.wilayaCode, communeCode: contact.location.communeCode,
          primaryLanguage: language, moderationStatus: "PENDING",
          searchText: normalizeSearchText(`${business.name} ${business.category} ${locationLabel(contact.location)} ${locationLabel(contact.location, "ar")}`),
          subdomain, isActive: false, useCustomPage: false,
        },
        select: { id: true, subdomain: true },
      })
    })
    // Email delivery cannot roll back a successfully created account and page.
    const emailResult = requiresVerification && account ? await sendOnboardingVerification(account.email, verificationToken, account.name, language) : { success: true }
    return NextResponse.json({ business: created, studioUrl: `/dashboard/businesses/${created.id}/studio`, requiresVerification, verificationEmailSent: emailResult.success }, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_DATA" }, { status: 400 })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "")
      return NextResponse.json({ code: target.includes("email") ? "EMAIL_EXISTS" : target.includes("subdomain") ? "SUBDOMAIN_CONFLICT" : "RETRY" }, { status: 409 })
    }
    console.error("Onboarding creation failed", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ code: "CREATION_FAILED" }, { status: 500 })
  }
}
