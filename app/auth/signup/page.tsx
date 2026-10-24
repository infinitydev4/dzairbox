"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useSyncExternalStore } from "react"
import { Header } from "@/components/header"
import { SignupForm } from "@/components/auth/signup-form"
import { useLanguage } from "@/components/language-provider"

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpPageContent />
    </Suspense>
  )
}

function SignUpFallback() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container flex items-center justify-center py-12">
        <div role="status" className="w-full max-w-md rounded-lg bg-white p-8 text-center text-gray-600 shadow-sm">
          <span className="sr-only">{t('common.loading')}</span>
          <div aria-hidden="true" className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-gray-100" />
            <div className="h-11 rounded bg-gray-100" />
            <div className="h-11 rounded bg-gray-100" />
            <div className="h-11 rounded bg-gray-100" />
          </div>
        </div>
      </main>
    </div>
  )
}

function SignUpPageContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const action = searchParams.get("action")
  const hasPendingBusiness = useSyncExternalStore(
    () => () => {},
    () => Boolean(localStorage.getItem("pendingBusinessData")) || action === "complete_business",
    () => action === "complete_business"
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <SignupForm 
            callbackUrl={callbackUrl || undefined} 
            hasPendingBusiness={hasPendingBusiness}
          />
        </div>
      </main>
    </div>
  )
}
