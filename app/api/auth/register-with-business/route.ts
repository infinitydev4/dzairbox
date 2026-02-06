import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, password, businessToken } = await request.json()

    if (!name || !email || !password || !businessToken) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { tempToken: businessToken }
    })

    if (!business) {
      return NextResponse.json(
        { error: "Service introuvable ou token invalide" },
        { status: 404 }
      )
    }

    if (business.tempExpiresAt && business.tempExpiresAt < new Date()) {
      await prisma.business.delete({
        where: { id: business.id }
      })
      return NextResponse.json(
        { error: "Le token a expiré. Veuillez recommencer l'inscription." },
        { status: 410 }
      )
    }

    if (business.userId) {
      return NextResponse.json(
        { error: "Ce service est déjà associé à un utilisateur" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER
      }
    })

    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        userId: user.id,
        tempToken: null,
        tempExpiresAt: null,
      }
    })

    console.log("Utilisateur créé et service associé avec succès:", { userId: user.id, businessId: updatedBusiness.id })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        business: {
          id: updatedBusiness.id,
          name: updatedBusiness.name,
          subdomain: updatedBusiness.subdomain
        },
        message: "Inscription réussie ! Votre service sera activé après validation."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription avec service:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
