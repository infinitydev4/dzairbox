"use client"

import { useState, useSyncExternalStore, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

function BrandMark() {
  return (
    <svg className="dz-brand-mark" width="34" height="34" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <path d="M19 2.5C10.2 2.5 3.5 9.2 3.5 18c0 11.3 15.5 17.5 15.5 17.5S34.5 29.3 34.5 18C34.5 9.2 27.8 2.5 19 2.5Z" fill="currentColor" />
      <path d="m19 10 8.5 4.7v9.2L19 28.7l-8.5-4.8v-9.2L19 10Z" stroke="#F7F6F0" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m10.7 14.8 8.3 4.7 8.3-4.7M19 19.5v9" stroke="#F7F6F0" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function SignInExperience() {
  const { t, language, setLanguage } = useLanguage()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || undefined
  const action = searchParams.get("action")
  const hasPendingBusiness = useSyncExternalStore(
    () => () => {},
    () => Boolean(localStorage.getItem("pendingBusinessData")) || action === "complete_business",
    () => action === "complete_business"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [resendNotice, setResendNotice] = useState("")
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { toast } = useToast()
  const BackIcon = language === "ar" ? ArrowRight : ArrowLeft
  const ForwardIcon = language === "ar" ? ArrowLeft : ArrowRight
  const signupHref = "/onboarding"

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendNotice("")
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      })
      const data = await response.json()
      if (response.ok) {
        setResendNotice(t("auth.signin.resendSent"))
        setShowResendButton(false)
      } else {
        setFormError(data.message || t("auth.signin.resendError"))
      }
    } catch {
      setFormError(t("auth.signin.errorUnexpected"))
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowResendButton(false)
    setFormError("")
    setResendNotice("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      })

      if (result?.ok) {
        toast({
          title: t("auth.signin.success"),
          description: hasPendingBusiness
            ? t("auth.signin.successPending")
            : t("auth.signin.successRedirect"),
        })
        window.location.assign(callbackUrl || "/dashboard")
      } else if (result?.error && result.error.includes("vérifier votre email")) {
        setUnverifiedEmail(formData.email)
        setShowResendButton(true)
        setFormError(result.error)
      } else {
        setFormError(result?.error || t("auth.signin.errorMessage"))
      }
    } catch {
      setFormError(t("auth.signin.errorUnexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`dz-home ob-root ob-login ${language === "ar" ? "ob-ar" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="ob-header">
        <Link href="/" className="dz-brand" aria-label="DzairBox">
          <BrandMark />
          <span>Dzair<span>Box</span></span>
        </Link>
        <span className="ob-header-label">{t("auth.signin.kicker")}</span>
        <div className="ob-header-actions">
          <div className="dz-language" aria-label={t("home.nav.language")}>
            <button type="button" lang="fr" aria-pressed={language === "fr"} onClick={() => setLanguage("fr")}>FR</button>
            <span aria-hidden="true" />
            <button type="button" lang="ar" aria-pressed={language === "ar"} onClick={() => setLanguage("ar")}>ع</button>
          </div>
          <Link className="ob-exit" href="/">
            <span>{t("onboarding.backHome")}</span>
            <BackIcon size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="ob-layout">
        <aside className="ob-guide">
          <div className="ob-guide-top">
            <span className="ob-guide-identity">
              <i className="ob-status-dot" />
              <strong>{t("onboarding.guideName")}</strong>
            </span>
            <span>{t("onboarding.guideRole")}</span>
          </div>
          <div className="ob-guide-intro">
            <h2>{t("auth.signin.guideIntro")}</h2>
            <p>{t("auth.signin.guideIntroSub")}</p>
          </div>
          <div className="ob-character-scene">
            <div className="ob-character-halo" />
            <div className="ob-character-orbit" />
            <Image
              className="ob-character"
              src="/images/onboarding/sami-guide.webp"
              alt={t("onboarding.guideAlt")}
              width={720}
              height={1080}
              sizes="(max-width:850px) 100px, 400px"
              preload
            />
            <span className="ob-character-badge">
              <ShieldCheck size={15} aria-hidden="true" />
              {t("auth.signin.badge")}
            </span>
          </div>
          <div className={`ob-guide-bubble${tipOpen ? " is-expanded" : ""}`}>
            <span className="ob-bubble-label">
              <Sparkles size={15} aria-hidden="true" />
              {t("onboarding.guideTip")}
            </span>
            <p>{t("auth.signin.tip")}</p>
            <button type="button" className="ob-tip-toggle" aria-expanded={tipOpen} onClick={() => setTipOpen((open) => !open)}>
              {t(tipOpen ? "onboarding.guideHide" : "onboarding.guideShow")}
            </button>
          </div>
          <p className="ob-guide-footer">{t("onboarding.guideFooter")}</p>
        </aside>

        <main className="ob-main">
          <form onSubmit={handleSubmit} noValidate>
            <div className="ob-heading">
              <span className="ob-heading-icon">
                <LockKeyhole size={23} aria-hidden="true" />
              </span>
              <h1>{hasPendingBusiness ? t("auth.signin.pendingBusiness") : t("auth.signin.title")}</h1>
              <p>{hasPendingBusiness ? t("auth.signin.pendingMessage") : t("auth.signin.description")}</p>
            </div>

            {hasPendingBusiness && (
              <div className="ob-connected ob-pending">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>{t("auth.signin.pendingBadge")}</strong>
                  <p>{t("auth.signin.pendingMessage")}</p>
                </div>
              </div>
            )}

            <p className="ob-login-prompt">
              {t("auth.signin.noAccount")}{" "}
              <Link href={signupHref}>{t("auth.signin.signup")}</Link>
            </p>
            <div className="ob-fields">
              <label className="ob-field" htmlFor="email">
                {t("auth.signin.email")}
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder={t("onboarding.account.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </label>
              <label className="ob-field" htmlFor="password">
                {t("auth.signin.password")}
                <span className="ob-password">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("auth.signin.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    aria-label={t(showPassword ? "onboarding.account.hide" : "onboarding.account.show")}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
            </div>

            {formError && <div className="ob-server-error" role="alert">{formError}</div>}
            {resendNotice && <p className="ob-restored" role="status">{resendNotice}</p>}
            {showResendButton && (
              <div className="ob-moderation">
                <Sparkles size={20} aria-hidden="true" />
                <div>
                  <p>{t("auth.signin.resendText")}</p>
                  <button type="button" className="ob-text-button" onClick={handleResendVerification} disabled={isResending}>
                    {isResending ? t("auth.signin.resending") : t("auth.signin.resend")}
                  </button>
                </div>
              </div>
            )}

            <div className="ob-form-actions">
              <span className="ob-no-card">
                <ShieldCheck size={15} aria-hidden="true" />
                {t("auth.signin.secure")}
              </span>
              <button type="submit" className="ob-primary" disabled={isLoading}>
                {isLoading ? <Loader2 size={17} className="ob-spin" aria-hidden="true" /> : null}
                {isLoading ? t("auth.signin.submitting") : t("auth.signin.submit")}
                <ForwardIcon size={17} aria-hidden="true" />
              </button>
            </div>
            <p className="ob-form-footnote">{t("onboarding.guideFooter")}</p>
          </form>
        </main>
      </div>
    </div>
  )
}
