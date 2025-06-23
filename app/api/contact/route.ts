import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()

    // Validation des données obligatoires
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // Pour l'instant, nous loggons les messages de contact
    // Dans une vraie application, vous enverriez un email ou stockeriez en base
    console.log("Nouveau message de contact:", {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // Ici vous pourriez :
    // 1. Envoyer un email à l'équipe support
    // 2. Stocker le message en base de données
    // 3. Intégrer avec un service comme SendGrid, Mailgun, etc.

    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais."
    })

  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message. Veuillez réessayer." },
      { status: 500 }
    )
  }
} 