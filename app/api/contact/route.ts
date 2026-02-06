import { NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/email"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()

    // Validation des champs requis
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // Validation de la longueur du message
    if (message.length < 10) {
      return NextResponse.json(
        { message: "Le message doit contenir au moins 10 caractères" },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { message: "Le message ne doit pas dépasser 2000 caractères" },
        { status: 400 }
      )
    }

    // Envoyer l'email
    const emailResult = await sendContactEmail(
      name,
      email,
      phone || '',
      subject,
      message
    )

    if (!emailResult.success) {
      console.error("Failed to send contact email:", emailResult.error)
      return NextResponse.json(
        { message: "Erreur lors de l'envoi du message. Veuillez réessayer." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
