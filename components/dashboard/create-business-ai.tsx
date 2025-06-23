"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, Loader2, ArrowLeft, Save } from "lucide-react"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatProgress } from "@/components/chat/chat-progress"
import { BusinessSummary } from "@/components/chat/business-summary"
import { DebugPanel } from "@/components/chat/debug-panel"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

interface CreateBusinessAIProps {
  onBack: () => void
}

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

export function CreateBusinessAI({ onBack }: CreateBusinessAIProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: t("createBusinessAI.welcomeMessage"),
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [t])

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
        content: t("createBusinessAI.errorMessage"),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBusiness = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businessData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors de la création")
      }

      toast({
        title: "Succès !",
        description: t("createBusinessAI.createSuccess"),
      })
      
      router.push("/dashboard/businesses")
      
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: t("createBusinessAI.createError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = () => {
    const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
    const completedFields = requiredFields.filter(field => {
      const value = businessData[field as keyof BusinessData]
      if (!value) return false
      
      if (typeof value === 'object') {
        return Object.keys(value).length > 0
      }
      
      return String(value).trim() !== ""
    })
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const progress = calculateProgress()

  if (isCompleted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>{t("createBusinessAI.back")}</span>
          </Button>
        </div>

        <BusinessSummary businessData={businessData} />
        
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              setIsCompleted(false)
              setBusinessData({})
              setMessages([{
                id: "restart",
                role: "assistant", 
                content: t("createBusinessAI.restartMessage"),
                timestamp: new Date()
              }])
            }}
            variant="outline"
            className="rounded-xl"
          >
            {t("createBusinessAI.modify")}
          </Button>
          <Button 
            onClick={handleCreateBusiness}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("createBusinessAI.creating")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("createBusinessAI.create")}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>{t("createBusinessAI.back")}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
            <CardHeader className="flex-shrink-0 border-b border-gray-200/50">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                {t("createBusinessAI.assistantTitle")}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="max-w-full">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-500 px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("createBusinessAI.thinking")}</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-gray-200/50 p-4 bg-gray-50/50 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("createBusinessAI.inputPlaceholder")}
                    disabled={isLoading}
                    className="flex-1 bg-white rounded-xl"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <ChatProgress progress={progress} businessData={businessData} />
          
          <DebugPanel businessData={businessData} progress={progress} />
          
          <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
            <CardHeader>
              <CardTitle className="text-sm">{t("createBusinessAI.tips.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>{t("createBusinessAI.tips.natural")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>{t("createBusinessAI.tips.precise")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>{t("createBusinessAI.tips.verify")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 