import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
interface PendingBusinessData {
  businessData: Record<string, unknown>
  timestamp: number
}

export function usePendingBusiness() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)

  useEffect(() => {
    const processPendingBusiness = async () => {
      // Ne traiter qu'une fois par session
      if (isProcessed || status !== "authenticated" || !session?.user || isCreating) {
        return
      }

      try {
        const pendingDataStr = localStorage.getItem('pendingBusinessData')
        if (!pendingDataStr) {
          return
        }

        const pendingData: PendingBusinessData = JSON.parse(pendingDataStr)
        
        // Vérifier que les données ne sont pas trop anciennes (24h max)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
        if (Date.now() - pendingData.timestamp > maxAge) {
          localStorage.removeItem('pendingBusinessData')
          return
        }

        // Vérifier que les données sont complètes
        const requiredFields = ["name", "category", "description", "address", "phone", "hours"]
        const isComplete = requiredFields.every(field => {
          const value = pendingData.businessData[field]
          if (!value) return false
          
          if (typeof value === 'object') {
            return Object.keys(value).length > 0
          }
          
          return String(value).trim() !== ""
        })

        if (!isComplete) {
          console.log("Données d'entreprise incomplètes, redirection vers le chat")
          localStorage.removeItem('pendingBusinessData')
          router.push('/register/chat')
          return
        }

        setIsCreating(true)
        setIsProcessed(true)

        // Créer l'entreprise avec les données sauvegardées
        const response = await fetch("/api/businesses/create-pending", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessData: pendingData.businessData
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Erreur lors de la création de l'entreprise")
        }

        // Nettoyer les données sauvegardées
        localStorage.removeItem('pendingBusinessData')

        // Afficher le succès
        toast({
          title: "🎉 Entreprise créée avec succès !",
          description: `${result.name} sera activée après validation par nos équipes.`,
        })

        // Rediriger vers le tableau de bord avec un message de succès
        setTimeout(() => {
          router.push(`/dashboard?success=business-created&id=${result.id}&subdomain=${result.subdomain}`)
        }, 2000)

      } catch (error) {
        console.error("Erreur lors de la création de l'entreprise:", error)
        
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Erreur lors de la création de l'entreprise",
          variant: "destructive",
        })
        
        // En cas d'erreur, rediriger vers le chat pour permettre à l'utilisateur de réessayer
        setTimeout(() => {
          router.push('/register/chat')
        }, 3000)
      } finally {
        setIsCreating(false)
      }
    }

    processPendingBusiness()
  }, [session, status, router, toast, isCreating, isProcessed])

  return {
    isCreating,
    isProcessed
  }
} 