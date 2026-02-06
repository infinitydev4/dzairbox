import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur (non vérifié)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER,
        emailVerified: null // Email non vérifié
      }
    })

    // Générer un token de vérification sécurisé
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Expire dans 24h

    // Sauvegarder le token de vérification
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: expiresAt,
      }
    })

    // Envoyer l'email de vérification
    const emailResult = await sendVerificationEmail(email, verificationToken, name)

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      // On continue quand même, l'utilisateur pourra demander un nouveau lien
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 