"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ChatProgress } from "./chat-progress"
import { BusinessSummary } from "./business-summary"
import { DebugPanel } from "./debug-panel"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface BusinessData {
  name?: string
  category?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  hours?: string | object
  services?: string[]
  website?: string
}

export function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    // Message d'accueil
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant pour l'inscription de votre entreprise sur DzBusiness. Je vais vous accompagner étape par étape pour créer votre profil d'entreprise. Commençons par le nom de votre entreprise. Comment s'appelle-t-elle ?",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId,
          businessData
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (data.businessData) {
        setBusinessData(data.businessData)
      }
      
      if (data.isCompleted) {
        setIsCompleted(true)
      }

    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Pouvez-vous répéter votre message ?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBusiness = async () => {
    if (!session) {
      // Sauvegarder les données d'entreprise dans localStorage
      localStorage.setItem('pendingBusinessData', JSON.stringify({
        businessData,
        timestamp: Date.now()
      }))
      
      // Rediriger vers la page d'inscription/connexion
      const returnUrl = encodeURIComponent('/register/chat?complete=true')
      window.location.href = `/auth/signin?callbackUrl=${returnUrl}&action=complete_business`
      return
    }

    // Vérifier que les données obligatoires sont présentes
    const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
    const missingFields = requiredFields.filter(field => {
      const value = businessData[field as keyof BusinessData]
      if (!value) return true
      
      // Gestion spéciale pour les objets (comme hours)
      if (typeof value === 'object') {
        return Object.keys(value).length === 0
      }
      
      // Pour les strings
      return String(value).trim() === ""
    })

    if (missingFields.length > 0) {
      alert(`Informations manquantes : ${missingFields.join(", ")}. Veuillez compléter la conversation.`)
      return
    }

    try {
      setIsLoading(true)
      
      // Logs pour debugging
      console.log("Création d'entreprise avec les données:", businessData)
      
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businessData),
      })

      const responseData = await response.json()
      console.log("Réponse de l'API:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors de la création de l'entreprise")
      }

      // Rediriger vers le dashboard avec un message de succès
      alert(`Entreprise créée avec succès ! Sous-domaine: ${responseData.subdomain}`)
      window.location.href = `/dashboard?success=business-created&id=${responseData.id}`
      
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      alert(`Erreur lors de la création de l'entreprise: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcul du progrès corrigé
  const calculateProgress = () => {
    const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
    const completedFields = requiredFields.filter(field => {
      const value = businessData[field as keyof BusinessData]
      if (!value) return false
      
      // Gestion spéciale pour les objets (comme hours)
      if (typeof value === 'object') {
        return Object.keys(value).length > 0
      }
      
      // Pour les strings
      return String(value).trim() !== ""
    })
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const progress = calculateProgress()

  useEffect(() => {
    // Vérifier s'il y a des données d'entreprise en attente au chargement
    const checkPendingData = () => {
      if (session) {
        const pendingDataStr = localStorage.getItem('pendingBusinessData')
        if (pendingDataStr) {
          try {
            const pendingData = JSON.parse(pendingDataStr)
            // Vérifier que les données ne sont pas trop anciennes (24h max)
            if (Date.now() - pendingData.timestamp < 24 * 60 * 60 * 1000) {
              setBusinessData(pendingData.businessData)
              setIsCompleted(true)
              // Nettoyer les données sauvegardées
              localStorage.removeItem('pendingBusinessData')
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des données en attente:', error)
            localStorage.removeItem('pendingBusinessData')
          }
        }
      }
    }

    checkPendingData()
  }, [session])

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600">
              🎉 Inscription terminée !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BusinessSummary businessData={businessData} />
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setIsCompleted(false)
                  setBusinessData({})
                  setMessages([{
                    id: "restart",
                    role: "assistant", 
                    content: "Parfait ! Recommençons. Quel est le nom de votre entreprise ?",
                    timestamp: new Date()
                  }])
                }}
                variant="outline"
              >
                Modifier les informations
              </Button>
              <Button 
                onClick={handleCreateBusiness}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon entreprise"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat principal */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                Assistant d'inscription DzBusiness
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="max-w-full">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-500 px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">L'assistant réfléchit...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-gray-50 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tapez votre message..."
                    disabled={isLoading}
                    className="flex-1 bg-white"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec progrès */}
        <div className="lg:col-span-1 space-y-4">
          <ChatProgress progress={progress} businessData={businessData} />
          
          <DebugPanel businessData={businessData} progress={progress} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Conseils</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Répondez naturellement aux questions</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Soyez précis pour l'adresse (wilaya, commune)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Vérifiez votre numéro de téléphone</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Indiquez vos horaires d'ouverture</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700 font-medium mb-1">Assistant IA</p>
                <p className="text-xs text-blue-600">
                  Powered by OpenAI GPT-4
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 