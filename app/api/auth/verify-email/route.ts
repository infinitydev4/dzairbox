import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { message: "Token manquant" },
        { status: 400 }
      )
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      )
    }

    // Vérifier si le token n'est pas expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { message: "Le lien de vérification a expiré. Veuillez vous réinscrire." },
        { status: 400 }
      )
    }

    // Mettre à jour l'utilisateur pour marquer l'email comme vérifié
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json(
      { 
        message: "Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { message: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    )
  }
}
