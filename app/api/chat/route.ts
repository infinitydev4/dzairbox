import { openai } from "@ai-sdk/openai"
import { generateText, type ModelMessage } from "ai"

export const dynamic = "force-dynamic"

type IncomingMessage = {
  role?: unknown
  content?: unknown
}

function toModelMessages(input: unknown): ModelMessage[] {
  if (!Array.isArray(input)) return []

  return input.flatMap((item): ModelMessage[] => {
    if (!item || typeof item !== "object") return []
    const { role, content } = item as IncomingMessage
    if ((role !== "user" && role !== "assistant" && role !== "system") || typeof content !== "string") {
      return []
    }
    return [{ role, content }]
  })
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const systemPrompt = `Tu es un assistant IA spécialisé dans l'inscription d'entreprises locales en Algérie. 
  Ton rôle est de guider les utilisateurs à travers le processus d'inscription de leur entreprise sur la plateforme DzBusiness.

  Tu dois collecter les informations suivantes de manière conversationnelle et naturelle :
  1. Nom de l'entreprise
  2. Type d'activité/secteur
  3. Description de l'entreprise
  4. Adresse complète (wilaya, commune, adresse exacte)
  5. Numéro de téléphone
  6. Email (optionnel)
  7. Horaires d'ouverture
  8. Services proposés
  9. Photos de l'entreprise (demander s'ils en ont)

  Règles importantes :
  - Sois amical et professionnel
  - Pose une question à la fois
  - Adapte-toi au contexte algérien (wilayas, communes, etc.)
  - Donne des exemples concrets
  - Encourage l'utilisateur
  - Si l'utilisateur semble confus, reformule ou donne plus d'explications
  - Utilise un français adapté au contexte algérien`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: toModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    return Response.json({ message: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
