import { Suspense } from "react"
import localFont from "next/font/local"
import { VerifyOnboardingEmail } from "@/components/create-service/verify-onboarding-email"
import "../../home.css"
import "../../onboarding/onboarding.css"

const displayFont = localFont({ src: "../../fonts/GeistVF.woff", variable: "--font-home-display", display: "swap" })
export default function VerifyEmailPage() {
  return <div className={displayFont.variable}><Suspense fallback={<div className="ob-verification-loading" role="status"><span className="ob-loading-symbol" aria-label="DzairBox" /></div>}><VerifyOnboardingEmail /></Suspense></div>
}
