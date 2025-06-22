"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SignupFormProps {
  callbackUrl?: string
  hasPendingBusiness?: boolean
}

export function SignupForm({ callbackUrl, hasPendingBusiness }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "", 
    password: "",
    confirmPassword: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (res.ok) {
        toast({
          title: "Compte créé !",
          description: hasPendingBusiness 
            ? "Connexion en cours pour finaliser votre entreprise..." 
            : "Connexion en cours...",
        })

        // Se connecter automatiquement après inscription
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: callbackUrl || "/dashboard",
          redirect: false,
        })

        if (result?.ok) {
          // Rediriger vers l'URL de callback ou dashboard
          window.location.href = callbackUrl || "/dashboard"
        } else {
          toast({
            title: "Erreur de connexion",
            description: "Compte créé mais erreur de connexion. Veuillez vous connecter manuellement.",
            variant: "destructive"
          })
        }
      } else {
        const error = await res.json()
        toast({
          title: "Erreur",
          description: error.message || "Erreur lors de la création du compte",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          {hasPendingBusiness 
            ? "Créez votre compte pour finaliser l'inscription de votre entreprise"
            : "Entrez vos informations pour créer un compte"
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
              Votre entreprise sera créée automatiquement après inscription
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom complet
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Votre nom complet"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
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
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer mon compte"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Déjà un compte ?{" "}
          <Link 
            href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
            className="text-emerald-600 hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 