"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

interface SigninFormProps {
  callbackUrl?: string
  hasPendingBusiness?: boolean
}

export function SigninForm({ callbackUrl, hasPendingBusiness }: SigninFormProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const { toast } = useToast()

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email envoyé",
          description: "Un nouvel email de vérification a été envoyé. Vérifiez votre boîte de réception.",
        })
        setShowResendButton(false)
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible d'envoyer l'email",
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
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowResendButton(false)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      })

      if (result?.ok) {
        toast({
          title: t('auth.signin.success'),
          description: hasPendingBusiness 
            ? t('auth.signin.successPending')
            : t('auth.signin.successRedirect'),
        })
        window.location.href = callbackUrl || "/dashboard"
      } else {
        // Vérifier si l'erreur est liée à l'email non vérifié
        if (result?.error && result.error.includes("vérifier votre email")) {
          setUnverifiedEmail(formData.email)
          setShowResendButton(true)
          toast({
            title: "Email non vérifié",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: t('auth.signin.error'),
            description: result?.error || t('auth.signin.errorMessage'),
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: t('auth.signin.error'),
        description: t('auth.signin.errorUnexpected'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{t('auth.signin.title')}</CardTitle>
        <CardDescription className="text-center">
          {hasPendingBusiness 
            ? t('auth.signin.pendingBusiness')
            : t('auth.signin.description')
          }
        </CardDescription>
        {hasPendingBusiness && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">🏢</span>
              <span className="text-sm text-emerald-700 font-medium">
                {t('auth.signin.pendingBadge')}
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {t('auth.signin.pendingMessage')}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.signin.email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.signin.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.signin.password')}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.signin.passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.signin.submitting') : t('auth.signin.submit')}
          </Button>
        </form>

        {showResendButton && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              Votre email n'a pas encore été vérifié. Consultez votre boîte de réception ou cliquez ci-dessous pour recevoir un nouvel email.
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
            </Button>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          {t('auth.signin.noAccount')}{" "}
          <Link 
            href={`/auth/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-emerald-600 hover:underline"
          >
            {t('auth.signin.signup')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 