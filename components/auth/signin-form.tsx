"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SigninFormProps {
  callbackUrl?: string
  hasPendingBusiness?: boolean
}

export function SigninForm({ callbackUrl, hasPendingBusiness }: SigninFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      })

      if (result?.ok) {
        toast({
          title: "Connexion réussie !",
          description: hasPendingBusiness 
            ? "Redirection pour finaliser votre entreprise..." 
            : "Redirection vers votre tableau de bord...",
        })
        window.location.href = callbackUrl || "/dashboard"
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Se connecter</CardTitle>
        <CardDescription className="text-center">
          {hasPendingBusiness 
            ? "Connectez-vous pour finaliser l'inscription de votre entreprise"
            : "Entrez vos identifiants pour vous connecter"
          }
        </CardDescription>
        {hasPendingBusiness && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">🏢</span>
              <span className="text-sm text-emerald-700 font-medium">
                Inscription d'entreprise en attente
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Votre entreprise sera créée automatiquement après connexion
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link 
            href={`/auth/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-emerald-600 hover:underline"
          >
            Créer un compte
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 