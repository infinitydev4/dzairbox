import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function RegisterChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Inscription de votre entreprise
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Notre assistant IA va vous accompagner étape par étape pour créer votre profil d'entreprise.
            Répondez simplement aux questions de manière naturelle.
          </p>
        </div>
        
        <ChatInterface />
      </main>
    </div>
  )
} 