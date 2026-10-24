import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOnboardingVerification } from "@/lib/onboarding-email"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const language = body.language === "ar" ? "ar" : "fr"

    if (!email) {
      return NextResponse.json(
        { message: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Aucun compte trouvé avec cet email" },
        { status: 404 }
      )
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Votre email est déjà vérifié" },
        { status: 400 }
      )
    }

    // Conserver les liens encore valides si un nouvel envoi échoue.
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, expires: { lt: new Date() } },
    })

    // Générer un nouveau token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Expire dans 24h

    // Sauvegarder le nouveau token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: expiresAt,
      }
    })

    // Envoyer l'email de vérification
    const emailResult = await sendOnboardingVerification(email, verificationToken, user.name || "", language)

    if (!emailResult.success) {
      console.error("Failed to send verification email")
      return NextResponse.json(
        { message: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Email de vérification envoyé avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email de vérification" },
      { status: 500 }
    )
  }
}
