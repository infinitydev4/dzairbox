"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { SigninForm } from "@/components/auth/signin-form"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export default function SignInPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [hasPendingBusiness, setHasPendingBusiness] = useState(false)
  
  const callbackUrl = searchParams.get("callbackUrl")
  const action = searchParams.get("action")

  useEffect(() => {
    // Vérifier s'il y a des données d'entreprise en attente
    const pendingData = localStorage.getItem('pendingBusinessData')
    if (pendingData || action === 'complete_business') {
      setHasPendingBusiness(true)
    }
  }, [action])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <SigninForm 
            callbackUrl={callbackUrl || undefined} 
            hasPendingBusiness={hasPendingBusiness}
          />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.signin.noAccount')}{" "}
              <Link 
                href="/auth/signup" 
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {t('auth.signin.signup')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 