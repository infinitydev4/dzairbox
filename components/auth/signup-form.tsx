"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

interface SignupFormProps {
  callbackUrl?: string
  hasPendingBusiness?: boolean
}

export function SignupForm({ callbackUrl, hasPendingBusiness }: SignupFormProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
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
        title: t('auth.signup.error'),
        description: t('auth.signup.errorPasswordMismatch'),
        variant: "destructive"
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: t('auth.signup.error'), 
        description: t('auth.signup.errorPasswordLength'),
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
        const data = await res.json()
        
        setRegisteredEmail(formData.email)
        setShowSuccessMessage(true)
        
        toast({
          title: t('auth.signup.success'),
          description: data.message || "Veuillez vérifier votre email pour activer votre compte.",
        })

        // Rediriger vers la page de connexion après 5 secondes
        setTimeout(() => {
          window.location.href = "/auth/signin"
        }, 5000)
      } else {
        const error = await res.json()
        toast({
          title: t('auth.signup.error'),
          description: error.message || t('auth.signup.errorCreation'),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t('auth.signup.error'),
        description: t('auth.signup.errorUnexpected'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{t('auth.signup.title')}</CardTitle>
        <CardDescription className="text-center">
          {hasPendingBusiness 
            ? t('auth.signup.pendingBusiness')
            : t('auth.signup.description')
          }
        </CardDescription>
        {hasPendingBusiness && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">🏢</span>
              <span className="text-sm text-emerald-700 font-medium">
                {t('auth.signup.pendingBadge')}
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {t('auth.signup.pendingMessage')}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showSuccessMessage ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Inscription réussie !
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Un email de vérification a été envoyé à <strong>{registeredEmail}</strong>
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-700 mb-2">
                  📧 Consultez votre boîte de réception et cliquez sur le lien de vérification pour activer votre compte.
                </p>
                <p className="text-xs text-gray-500">
                  Vous serez redirigé vers la page de connexion dans quelques instants...
                </p>
              </div>
            </div>
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
            >
              <Link href="/auth/signin">
                Aller à la page de connexion
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {t('auth.signup.name')}
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.signup.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('auth.signup.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  {t('auth.signup.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('auth.signup.confirmPassword')}
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.signup.submitting') : t('auth.signup.submit')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {t('auth.signup.hasAccount')}{" "}
              <Link 
                href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
                className="text-emerald-600 hover:underline"
              >
                {t('auth.signup.signin')}
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 