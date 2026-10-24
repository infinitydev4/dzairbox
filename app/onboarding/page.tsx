import type { Metadata } from "next"
import localFont from "next/font/local"
import { ServiceOnboarding } from "@/components/create-service/service-onboarding"
import "../home.css"
import "./onboarding.css"
import "../studio.css"

const displayFont = localFont({ src: "../fonts/GeistVF.woff", variable: "--font-home-display", display: "swap" })
export const metadata: Metadata = {
  title: "Créer ma page business",
  description: "Créez votre compte, présentez votre activité et personnalisez votre page business avec le parcours guidé DzairBox.",
  robots: { index: false, follow: true },
}
export default function OnboardingPage() {
  return <div className={displayFont.variable}><ServiceOnboarding /></div>
}
