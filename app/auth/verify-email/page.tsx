"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export default function VerifyEmailPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de vérification manquant")
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Votre email a été vérifié avec succès !")
        
        // Redirection après 3 secondes
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.message || "Erreur lors de la vérification de l'email")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Une erreur est survenue lors de la vérification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-100">
            {status === "loading" && (
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === "loading" && "Vérification en cours..."}
            {status === "success" && "Email vérifié !"}
            {status === "error" && "Erreur de vérification"}
          </CardTitle>
          
          <CardDescription className="text-base text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-800">
                Vous allez être redirigé vers la page de connexion dans quelques instants...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 text-center">
                  Le lien de vérification est peut-être expiré ou invalide.
                </p>
              </div>
              
              <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                <Link href="/auth/signup">
                  Créer un nouveau compte
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">
                  Retour à la connexion
                </Link>
              </Button>
            </div>
          )}

          {status === "success" && (
            <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              <Link href="/auth/signin">
                Se connecter maintenant
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
