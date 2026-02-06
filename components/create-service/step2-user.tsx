"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { User, Mail, Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

interface CreateServiceStep2Props {
  businessData: any
  businessToken: string | null
  onBack: () => void
}

export function CreateServiceStep2({ businessData, businessToken, onBack }: CreateServiceStep2Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: t("createService.step2.errors.title"),
          description: t("createService.step2.errors.required"),
          variant: "destructive"
        })
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t("createService.step2.errors.title"),
          description: t("createService.step2.errors.passwordMismatch"),
          variant: "destructive"
        })
        return
      }

      if (formData.password.length < 8) {
        toast({
          title: t("createService.step2.errors.title"),
          description: t("createService.step2.errors.passwordLength"),
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/auth/register-with-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          businessToken: businessToken
        })
      })

      const result = await response.json()

      if (response.ok) {
        setRegisteredEmail(formData.email)
        setShowSuccessMessage(true)
        
        toast({
          title: t("createService.step2.success.title"),
          description: result.message || "Veuillez vérifier votre email pour activer votre compte.",
        })

        // Rediriger vers la page de connexion après 5 secondes
        setTimeout(() => {
          router.push("/auth/signin")
        }, 5000)
      } else {
        toast({
          title: t("createService.step2.errors.title"),
          description: result.error || t("createService.step2.errors.unexpected"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error registering user:", error)
      toast({
        title: t("createService.step2.errors.title"),
        description: t("createService.step2.errors.unexpected"),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8 max-w-2xl mx-auto px-4 sm:px-0">
      <Button onClick={onBack} variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl text-sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>{t("common.back")}</span>
      </Button>

      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-center text-xl sm:text-2xl">
            {t("createService.step2.title")}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            {t("createService.step2.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
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
                onClick={() => router.push("/auth/signin")}
                variant="outline" 
                className="w-full"
              >
                Aller à la page de connexion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("createService.step2.name")} *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("createService.step2.namePlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("createService.step2.email")} *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("createService.step2.emailPlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("createService.step2.password")} *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={t("createService.step2.passwordPlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                  required
                />
                <p className="text-xs text-gray-500">
                  {t("createService.step2.passwordHelper")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("createService.step2.confirmPassword")} *
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder={t("createService.step2.confirmPasswordPlaceholder")}
                  className="rounded-xl text-sm sm:text-base"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  {t("createService.step2.infoMessage")}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl py-3 sm:py-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("createService.step2.submitting")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t("createService.step2.submit")}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
