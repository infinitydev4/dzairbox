"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCheck, CircleHelp, Loader2, Mail, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

// Shared by effect instances so Strict Mode never consumes a single-use token twice.
const verificationRequests = new Map<string, Promise<boolean>>()
function verifyToken(token: string) {
  const current = verificationRequests.get(token)
  if (current) return current
  const pending = fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(response => response.ok).catch(() => false)
  verificationRequests.set(token, pending)
  return pending
}

export function VerifyOnboardingEmail() {
  const { data: session, update } = useSession()
  const params = useSearchParams()
  const token = params.get("token")
  const requestedLanguage = params.get("lang")
  const { language, setLanguage, t } = useLanguage()
  const tr = (key: string) => t(`onboarding.${key}`)
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error")
  const [destination, setDestination] = useState("/dashboard/businesses")
  const [email, setEmail] = useState("")
  const [resend, setResend] = useState<"idle" | "busy" | "sent" | "error">("idle")
  const sentRef = useRef(false)
  const appliedLanguage = useRef(false)
  const Forward = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    if (appliedLanguage.current) return
    appliedLanguage.current = true
    if (requestedLanguage === "fr" || requestedLanguage === "ar") setLanguage(requestedLanguage)
  }, [requestedLanguage, setLanguage])
  useEffect(() => {
    if (!token) return
    let active = true
    void verifyToken(token).then(ok => { if (active) { setStatus(ok ? "success" : "error"); if(ok) { void update(); try { const target=localStorage.getItem("dzairbox-last-studio"); if(target && /^\/dashboard\/businesses\/[^/]+\/studio$/.test(target)) setDestination(target) } catch {} } } })
    return () => { active = false }
  }, [token, update])

  async function resendEmail(event: FormEvent) {
    event.preventDefault()
    if (sentRef.current) return
    sentRef.current = true
    setResend("busy")
    try {
      const response = await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), language }) })
      setResend(response.ok ? "sent" : "error")
      if (!response.ok) sentRef.current = false
    } catch { setResend("error"); sentRef.current = false }
  }
  return <div className={`dz-home ob-root ob-verification ${language === "ar" ? "ob-ar" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
    <header className="ob-header"><Link className="dz-brand" href="/">Dzair<span>Box</span></Link><div className="ob-header-actions"><div className="dz-language" aria-label={t("home.nav.language")}><button type="button" aria-pressed={language === "fr"} onClick={() => setLanguage("fr")}>FR</button><span /><button type="button" aria-pressed={language === "ar"} onClick={() => setLanguage("ar")}>ع</button></div></div></header>
    <main className="ob-verification-main"><div className="ob-verification-guide"><div className="ob-verification-portrait"><Image src="/images/onboarding/sami-guide.webp" alt={tr("guideAlt")} width={200} height={300} /></div><span>{tr("guideName")}</span></div><div className="ob-heading"><span className="ob-heading-icon">{status === "loading" ? <Loader2 className="ob-spin" aria-hidden="true" /> : status === "success" ? <CheckCheck aria-hidden="true" /> : <CircleHelp aria-hidden="true" />}</span><h1>{tr(`verify.${status}`)}</h1><p role="status">{status === "success" ? tr("verify.successText") : status === "error" ? tr("verify.errorText") : tr("verify.loading")}</p></div>
    {status === "success" && <div className="ob-moderation"><ShieldCheck size={24} aria-hidden="true" /><p>{tr("review.moderation")}</p></div>}
    {status === "error" && <form className="ob-fields" onSubmit={resendEmail}><div className="ob-field"><label htmlFor="verify-email">{tr("verify.email")}</label><input id="verify-email" type="email" dir="ltr" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={tr("account.emailPlaceholder")} /></div><button type="submit" className="ob-primary" disabled={resend === "busy" || resend === "sent"}><Mail size={17} aria-hidden="true" />{tr(resend === "busy" ? "success.resending" : "success.resend")}</button>{resend === "sent" && <p className="ob-field-hint" role="status">{tr("success.resent")}</p>}{resend === "error" && <p className="ob-field-error" role="alert">{tr("success.resendError")}</p>}</form>}
    {status !== "loading" && <Link className={status === "success" ? "ob-primary ob-verification-cta" : "ob-success-home"} href={session ? destination : `/auth/signin?callbackUrl=${encodeURIComponent(destination)}`}>{tr(session ? "success.dashboard" : "signIn")}<Forward size={17} aria-hidden="true" /></Link>}<Link className="ob-success-home" href="/">{tr("verify.home")}</Link></main>
  </div>
}
