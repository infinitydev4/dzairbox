import { NextRequest, NextResponse } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
import { ConversationChain } from "langchain/chains"
import { BufferMemory } from "langchain/memory"
import { PromptTemplate } from "@langchain/core/prompts"

// Store des sessions en mémoire (en production, utiliser Redis ou une DB)
const sessionStore = new Map<string, BufferMemory>()

// Template de prompt pour l'assistant d'inscription
const BUSINESS_REGISTRATION_PROMPT = PromptTemplate.fromTemplate(`
Tu es un assistant IA spécialisé dans l'inscription d'entreprises locales en Algérie sur la plateforme DzBusiness.

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
Assistant:`)

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, businessData } = await req.json()

    console.log("Données reçues:", { sessionId, businessData, lastMessage: messages[messages.length - 1]?.content })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Initialiser ou récupérer la mémoire de la session
    let memory = sessionStore.get(sessionId)
    if (!memory) {
      memory = new BufferMemory({
        memoryKey: "history",
        inputKey: "input",
      })
      sessionStore.set(sessionId, memory)
    }

    // Initialiser le modèle OpenAI
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
      temperature: 0.7,
      maxTokens: 500,
    })

    // Créer la chaîne de conversation
    const chain = new ConversationChain({
      llm: model,
      memory: memory,
      prompt: BUSINESS_REGISTRATION_PROMPT,
    })

    // Dernière entrée utilisateur
    const lastUserMessage = messages[messages.length - 1]?.content || ""

    // Analyser la réponse pour extraire les données d'entreprise
    const updatedBusinessData = await extractBusinessData(
      lastUserMessage,
      businessData || {},
      model
    )

    console.log("Données mises à jour:", updatedBusinessData)

    // Exécuter la conversation
    const response = await chain.invoke({
      input: lastUserMessage,
      businessData: JSON.stringify(updatedBusinessData, null, 2),
    })

    // Vérifier si l'inscription est complète
    const isCompleted = checkIfRegistrationComplete(updatedBusinessData)
    
    console.log("Inscription complète?", isCompleted)

    return NextResponse.json({
      message: response.response,
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

// Fonction pour extraire les données d'entreprise du message utilisateur
async function extractBusinessData(
  userMessage: string,
  currentData: any,
  model: ChatOpenAI
) {
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
- website: Site web (ajoute https:// si manquant)
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
    const result = await model.invoke(extractionPrompt)
    const extractedText = result.content as string
    
    console.log("Réponse IA pour extraction:", extractedText)
    
    // Nettoyer la réponse pour extraire le JSON - plusieurs tentatives
    let jsonString = extractedText.trim()
    
    // Tentative 1: JSON direct
    let jsonMatch = jsonString.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Tentative 2: JSON avec backticks
      jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) jsonString = jsonMatch[1]
    } else {
      jsonString = jsonMatch[0]
    }
    
    if (jsonString) {
      const extracted = JSON.parse(jsonString)
      const merged = { ...currentData }
      
      // Merge intelligent - ne pas écraser avec des valeurs vides
      Object.keys(extracted).forEach(key => {
        if (extracted[key] && String(extracted[key]).trim() !== "") {
          merged[key] = extracted[key]
        }
      })
      
      console.log("Données extraites et mergées:", merged)
      return merged
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction des données:", error)
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message)
    }
  }

  console.log("Aucune donnée extraite, retour des données actuelles")
  return currentData
}

// Vérifier si l'inscription est complète
function checkIfRegistrationComplete(businessData: any): boolean {
  const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
  return requiredFields.every(field => {
    const value = businessData[field]
    if (!value) return false
    
    // Gestion spéciale pour les objets (comme hours)
    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }
    
    // Pour les strings
    return String(value).trim() !== ""
  })
}

// Nettoyer les sessions anciennes (appelé périodiquement)
setInterval(() => {
  // En production, implémenter une logique de nettoyage basée sur le timestamp
  if (sessionStore.size > 100) {
    const firstKey = sessionStore.keys().next().value
    if (firstKey) sessionStore.delete(firstKey)
  }
}, 60000) // Nettoyer toutes les minutes 