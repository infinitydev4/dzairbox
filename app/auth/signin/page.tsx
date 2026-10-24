import type { Metadata } from "next"
import localFont from "next/font/local"
import { Suspense } from "react"
import { SignInExperience } from "@/components/auth/signin-form"
import "../../home.css"
import "../../onboarding/onboarding.css"

const displayFont = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-home-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à DzairBox pour retrouver votre activité et poursuivre votre page.",
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  return (
    <div className={displayFont.variable}>
      <Suspense fallback={<div className="ob-verification-loading"><div className="ob-loading-symbol" role="status" /></div>}>
        <SignInExperience />
      </Suspense>
    </div>
  )
}
