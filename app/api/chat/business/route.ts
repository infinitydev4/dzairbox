import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type BusinessRecord = Record<string, unknown>
type SessionTurn = { role: "user" | "assistant"; content: string }

// Historique par session (en production, utiliser Redis ou une DB).
// Même format que BufferMemory : préfixes Human / AI, tour courant hors historique.
const sessionStore = new Map<string, SessionTurn[]>()

const BUSINESS_REGISTRATION_PROMPT = `Tu es un assistant IA spécialisé dans l'inscription d'entreprises locales en Algérie sur la plateforme DzBusiness.

CONTEXTE ACTUEL:
Données collectées: {businessData}

TON RÔLE:
- Guider l'utilisateur de manière conversationnelle et naturelle
- Collecter TOUTES les informations nécessaires pour l'inscription
- Être patient et encourageant
- Adapter ton langage au contexte algérien

INFORMATIONS À COLLECTER (obligatoires):
1. Nom de l'entreprise (name)
2. Type d'activité/secteur (category)
3. Description de l'entreprise (description)
4. Adresse complète (address) - avec wilaya et commune
5. Numéro de téléphone (phone)
6. Horaires d'ouverture (hours)

INFORMATIONS OPTIONNELLES:
7. Email (email)
8. Site web (website)
9. Services proposés détaillés (services)

RÈGLES IMPORTANTES:
- Pose UNE SEULE question à la fois
- Valide les informations données (format téléphone, email, etc.)
- Encourage l'utilisateur à donner des détails
- Pour l'adresse, demande wilaya, commune, et adresse exacte
- Pour les horaires, demande les jours et heures précis
- Une fois toutes les infos obligatoires collectées, résume et demande confirmation

EXEMPLE D'ADRESSES ALGÉRIENNES:
- "Cité 20 Août 1955, Skikda, Wilaya de Skikda"
- "Boulevard Colonel Amirouche, Tizi Ouzou, Wilaya de Tizi Ouzou"

Historique de conversation:
{history}

Utilisateur: {input}
Assistant:`

function formatHistory(turns: SessionTurn[]): string {
  return turns
    .map((turn) => `${turn.role === "user" ? "Human" : "AI"}: ${turn.content}`)
    .join("\n")
}

function renderRegistrationPrompt(businessData: BusinessRecord, history: string, input: string) {
  return BUSINESS_REGISTRATION_PROMPT
    .replaceAll("{businessData}", JSON.stringify(businessData, null, 2))
    .replaceAll("{history}", history)
    .replaceAll("{input}", input)
}

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, businessData } = await req.json()
    const sessionKey = typeof sessionId === "string" ? sessionId : ""
    const messageList = Array.isArray(messages) ? messages : []
    const lastMessage = messageList[messageList.length - 1] as { content?: unknown } | undefined
    const lastUserMessage = typeof lastMessage?.content === "string" ? lastMessage.content : ""

    console.log("Données reçues:", { sessionId, businessData, lastMessage: lastUserMessage })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const history = sessionStore.get(sessionKey) ?? []
    const currentData: BusinessRecord =
      businessData && typeof businessData === "object" && !Array.isArray(businessData)
        ? businessData
        : {}

    const updatedBusinessData = await extractBusinessData(lastUserMessage, currentData)

    console.log("Données mises à jour:", updatedBusinessData)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: renderRegistrationPrompt(updatedBusinessData, formatHistory(history), lastUserMessage),
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    sessionStore.set(sessionKey, [
      ...history,
      { role: "user", content: lastUserMessage },
      { role: "assistant", content: text },
    ])

    const isCompleted = checkIfRegistrationComplete(updatedBusinessData)

    console.log("Inscription complète?", isCompleted)

    return NextResponse.json({
      message: text,
      businessData: updatedBusinessData,
      isCompleted,
    })
  } catch (error) {
    console.error("Error in business chat API:", error)
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    )
  }
}

async function extractBusinessData(userMessage: string, currentData: BusinessRecord): Promise<BusinessRecord> {
  const extractionPrompt = `
Tu es un expert en extraction de données d'entreprises algériennes. Analyse le message utilisateur et extrait TOUTES les informations pertinentes.

INSTRUCTIONS CRUCIALES:
1. CORRIGE automatiquement les erreurs de frappe et d'orthographe
2. NORMALISE les termes métiers (ex: "electricien" → "électricien", "electrique" → "électrique")
3. STRUCTURE les données en JSON valide
4. COMBINE avec les données existantes sans les écraser

MESSAGE UTILISATEUR: "${userMessage}"
DONNÉES ACTUELLES: ${JSON.stringify(currentData)}

CHAMPS À EXTRAIRE ET CORRIGER:
- name: Nom exact de l'entreprise (corrige l'orthographe)
- category: Secteur d'activité normalisé (électricien, plombier, boulangerie, pharmacie, restaurant, etc.)
- description: Description détaillée de l'entreprise et ses services
- address: Adresse complète avec wilaya et commune (normalise les noms de lieux)
- phone: Numéro de téléphone algérien (format: 05XX XX XX XX ou 07XX XX XX XX)
- email: Adresse email valide
- facebook: Nom d'utilisateur Facebook (sans @ ni URL)
- instagram: Nom d'utilisateur Instagram (sans @ ni URL)
- tiktok: Nom d'utilisateur TikTok (sans @ ni URL)
- youtube: Nom d'utilisateur YouTube (sans @ ni URL)
- hours: Horaires d'ouverture structurés
- services: Services proposés (array de chaînes)

EXEMPLES DE CORRECTIONS:
- "electricien tertiare" → {"category": "électricien", "description": "Services électriques tertiaires"}
- "boulangeri" → {"category": "boulangerie"}
- "alger centre" → {"address": "Alger Centre, Wilaya d'Alger"}
- "0550123456" → {"phone": "0550 12 34 56"}

RÈGLES:
- Si le message contient un nom d'entreprise, extrait-le dans "name"
- Si le message décrit une activité, normalise-la dans "category"
- Si le message donne des détails, ajoute-les à "description"
- Combine intelligemment avec les données existantes
- Retourne UNIQUEMENT du JSON valide, pas de texte supplémentaire

RÉPONSE JSON ATTENDUE:
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: extractionPrompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    console.log("Réponse IA pour extraction:", text)

    const extracted = parseExtractedJson(text)
    if (!extracted) {
      console.log("Aucune donnée extraite, retour des données actuelles")
      return currentData
    }

    const merged: BusinessRecord = { ...currentData }
    for (const key of Object.keys(extracted)) {
      const value = extracted[key]
      if (value && String(value).trim() !== "") {
        merged[key] = value
      }
    }

    console.log("Données extraites et mergées:", merged)
    return merged
  } catch (error) {
    console.error("Erreur lors de l'extraction des données:", error)
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message)
    }
  }

  console.log("Aucune donnée extraite, retour des données actuelles")
  return currentData
}

function parseExtractedJson(extractedText: string): BusinessRecord | null {
  let jsonString = extractedText.trim()
  const directMatch = jsonString.match(/\{[\s\S]*\}/)
  if (!directMatch) {
    const fencedMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (!fencedMatch) return null
    jsonString = fencedMatch[1]
  } else {
    jsonString = directMatch[0]
  }

  const parsed: unknown = JSON.parse(jsonString)
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
  return parsed as BusinessRecord
}

function checkIfRegistrationComplete(businessData: BusinessRecord): boolean {
  const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
  return requiredFields.every((field) => {
    const value = businessData[field]
    if (!value) return false

    if (typeof value === "object") {
      return Object.keys(value).length > 0
    }

    return String(value).trim() !== ""
  })
}

// Nettoyer les sessions anciennes (appelé périodiquement)
setInterval(() => {
  if (sessionStore.size > 100) {
    const firstKey = sessionStore.keys().next().value
    if (firstKey) sessionStore.delete(firstKey)
  }
}, 60000)
