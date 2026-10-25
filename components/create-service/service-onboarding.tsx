"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { trackEvent } from "@/lib/studio/events";
import { LocationFields } from "@/components/studio/location-fields";
import { locationLabel } from "@/lib/locations";
import { businessCategories } from "@/lib/constants";
import {
  accountSchema,
  activitySchema,
  contactSchema,
  draftSchema,
  emptyOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/service-onboarding";
const KEY = "dzairbox_onboarding_v2";
const steps = ["account", "activity", "contact", "review"] as const;
const icons = [UserRound, Store, MapPin, CheckCheck];
export function ServiceOnboarding() {
  const { t, language, setLanguage } = useLanguage();
  const tr = (k: string) => t(`onboarding.${k}`);
  const st = (k: string) => t(`studio.${k}`);
  const { data: session, status } = useSession();
  const [draft, setDraft] = useState<OnboardingDraft>(emptyOnboardingDraft);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(true);
  const [restored, setRestored] = useState(false);
  const [show, setShow] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const lock = useRef(false);
  const completed = useRef(false);
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const readyRef = useRef(ready);
  draftRef.current = draft;
  stepRef.current = step;
  readyRef.current = ready;
  const connected = !!session;
  const Forward = language === "ar" ? ArrowLeft : ArrowRight;
  const Backward = language === "ar" ? ArrowRight : ArrowLeft;
  function persist(nextDraft = draftRef.current, nextStep = stepRef.current) {
    if (!readyRef.current || completed.current) return;
    try {
      const { password: _password, ...account } = nextDraft.account;
      localStorage.setItem(
        KEY,
        JSON.stringify({ ...nextDraft, account, step: nextStep }),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  useEffect(() => {
    const leave = () => {
      persist();
      if (!completed.current) trackEvent("signup_abandon");
    };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, []);
  useEffect(() => {
    trackEvent("signup_start");
    const timer = setTimeout(() => {
      let initial = {
        ...emptyOnboardingDraft(),
        requestId: crypto.randomUUID(),
      };
      try {
        const data = localStorage.getItem(KEY);
        if (data) {
          const parsed = draftSchema.safeParse(JSON.parse(data));
          if (parsed.success) {
            initial = {
              ...parsed.data,
              account: { ...parsed.data.account, password: "" },
            };
            if (typeof parsed.data.step === "number") setStep(parsed.data.step);
            setRestored(true);
          }
        }
      } catch {
        setSaved(false);
      }
      setDraft(initial);
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready || createdUrl) return;
    const timer = setTimeout(() => {
      try {
        const { password: _password, ...account } = draft.account;
        localStorage.setItem(
          KEY,
          JSON.stringify({ ...draft, account, step }),
        );
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, ready, createdUrl, step]);
  function go(index: number) {
    if (index > 0 && index < 4) trackEvent(`signup_${steps[index - 1]}`);
    setStep(index);
    setErrors({});
    setError("");
    setRestored(false);
    persist(draft, index);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  }
  function update(
    section: "account" | "business" | "contact",
    field: string,
    value: string,
  ) {
    setDraft((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));
    setErrors({});
    setError("");
  }
  function validate(index: number) {
    if (index === 0 && connected) return true;
    const result =
      index === 0
        ? accountSchema.safeParse(draft.account)
        : index === 1
          ? activitySchema.safeParse(draft.business)
          : contactSchema.safeParse(draft.contact);
    if (result.success) return true;
    setStep(index);
    setErrors(
      Object.fromEntries(
        result.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    );
    return false;
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    if (step < 3) {
      if (validate(step)) go(step + 1);
      return;
    }
    for (let i = 0; i < 3; i++) if (!validate(i)) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          account: connected ? undefined : draft.account,
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.code === "EMAIL_EXISTS" ? "existing" : "unexpected");
        return;
      }
      completed.current = true;
      setCreatedUrl(data.studioUrl);
      try {
        localStorage.removeItem(KEY);
      } catch {}
      if (!connected) {
        const result = await signIn("credentials", {
          email: draft.account.email.toLowerCase().trim(),
          password: draft.account.password,
          redirect: false,
        });
        if (!result?.ok) {
          setError("session");
          return;
        }
      }
      try {
        localStorage.setItem("dzairbox-last-studio", data.studioUrl);
      } catch {}
      window.location.assign(data.studioUrl);
    } catch {
      setError("unexpected");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const fieldError = (key: string) =>
    errors[key] ? (
      <span className="ob-field-error" role="alert">
        {tr(
          `errors.${["name", "email", "password", "businessName", "category", "phone", "address"].includes(errors[key]) ? errors[key] : key === "location" ? "location" : key}`,
        )}
      </span>
    ) : null;
  const Icon = icons[step];
  return (
    <div
      className={`dz-home ob-root ${language === "ar" ? "ob-ar" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="ob-header">
        <Link href="/" className="dz-brand">
          Dzair<span>Box</span>
        </Link>
        <span className="ob-header-label">{tr("journey")}</span>
        <div className="ob-header-actions">
          <div className="dz-language">
            <button
              type="button"
              lang="fr"
              aria-pressed={language === "fr"}
              onClick={() => setLanguage("fr")}
            >
              FR
            </button>
            <span />
            <button
              type="button"
              lang="ar"
              aria-pressed={language === "ar"}
              onClick={() => setLanguage("ar")}
            >
              ع
            </button>
          </div>
          <Link className="ob-exit" href="/">
            {tr("backHome")}
            <Backward size={16} />
          </Link>
        </div>
      </header>
      <div className="ob-layout">
        <aside className="ob-guide">
          <div className="ob-guide-top">
            <span className="ob-guide-identity">
              <i className="ob-status-dot" />
              <strong>{tr("guideName")}</strong>
            </span>
            <span>{tr("guideRole")}</span>
          </div>
          <div className="ob-guide-intro">
            <h2>{tr("guideIntro")}</h2>
            <p>{tr("guideIntroSub")}</p>
          </div>
          <div className="ob-character-scene">
            <div className="ob-character-halo" />
            <div className="ob-character-orbit" />
            <Image
              className="ob-character"
              src="/images/onboarding/sami-guide.webp"
              alt={tr("guideAlt")}
              width={720}
              height={1080}
              sizes="(max-width:850px) 100px,400px"
              preload
            />
            <span className="ob-character-badge">
              <Sparkles size={15} />
              {tr("minutes")}
            </span>
          </div>
          <div className="ob-guide-bubble is-expanded">
            <span className="ob-bubble-label">
              <Sparkles size={15} />
              {tr("guideTip")}
            </span>
            <p aria-live="polite">{tr(`${steps[step]}.tip`)}</p>
          </div>
          <p className="ob-guide-footer">{tr("guideFooter")}</p>
        </aside>
        <main className="ob-main">
          <div className="ob-progress-top">
            <span>
              {tr("step")} <strong>{step + 1}</strong> {tr("of")} 4
            </span>
            <span>
              <Clock3 size={14} />
              {tr("minutes")}
            </span>
          </div>
          <nav className="ob-stepper" aria-label={tr("progressAria")}>
            <ol style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {steps.map((key, index) => {
                const StepIcon = icons[index];
                return (
                  <li
                    key={key}
                    className={
                      step === index
                        ? "is-current"
                        : index < step
                          ? "is-complete"
                          : ""
                    }
                  >
                    <button
                      type="button"
                      aria-current={step === index ? "step" : undefined}
                      disabled={index > step || busy}
                      onClick={() => go(index)}
                    >
                      <span className="ob-step-node">
                        {index < step ? (
                          <Check size={17} />
                        ) : (
                          <StepIcon size={17} />
                        )}
                      </span>
                      {tr(`${key}.label`)}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="ob-draft-line">
            <span role="status">
              <CheckCheck size={14} />
              {tr(saved ? "saved" : "unsaved")}
            </span>
            <button
              type="button"
              disabled={busy}
              aria-label={tr("restart")}
              onClick={() => {
                if (confirm(tr("restartConfirm"))) {
                  setDraft({
                    ...emptyOnboardingDraft(),
                    requestId: crypto.randomUUID(),
                  });
                  go(0);
                }
              }}
            >
              <RotateCcw size={14} />
              {tr("restart")}
            </button>
          </div>
          {restored && <p className="ob-restored">{tr("restored")}</p>}
          <form onSubmit={submit} noValidate>
            <fieldset
              className="ob-form-fields"
              disabled={busy || !ready || status === "loading"}
            >
              <div className="ob-step-content" key={step}>
                <div className="ob-heading">
                  <span className="ob-heading-icon">
                    <Icon size={23} />
                  </span>
                  <h1 tabIndex={-1} ref={heading}>
                    {tr(`${steps[step]}.title`)}
                  </h1>
                  <p>{tr(`${steps[step]}.description`)}</p>
                </div>
                <div className="ob-fields">
                  {step === 0 &&
                    (connected ? (
                      <div className="ob-connected">
                        <ShieldCheck />
                        <div>
                          <strong>{session?.user?.name}</strong>
                          <p>{session?.user?.email}</p>
                          <p>{tr("connected")}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="ob-login-prompt">
                          {tr("login")}{" "}
                          <Link href="/auth/signin?callbackUrl=%2Fonboarding">
                            {tr("signIn")}
                          </Link>
                        </p>
                        <label className="ob-field">
                          {tr("account.name")} *
                          <input
                            autoComplete="name"
                            value={draft.account.name}
                            maxLength={100}
                            aria-invalid={!!errors.name}
                            onChange={(e) =>
                              update("account", "name", e.target.value)
                            }
                            placeholder={tr("account.namePlaceholder")}
                          />
                          {fieldError("name")}
                        </label>
                        <label className="ob-field">
                          {tr("account.email")} *
                          <input
                            type="email"
                            autoComplete="email"
                            dir="ltr"
                            value={draft.account.email}
                            aria-invalid={!!errors.email}
                            onChange={(e) =>
                              update("account", "email", e.target.value)
                            }
                            placeholder={tr("account.emailPlaceholder")}
                          />
                          {fieldError("email")}
                        </label>
                        <label className="ob-field">
                          {tr("account.password")} *
                          <span className="ob-password">
                            <input
                              type={show ? "text" : "password"}
                              autoComplete="new-password"
                              minLength={8}
                              maxLength={128}
                              value={draft.account.password}
                              aria-invalid={!!errors.password}
                              onChange={(e) =>
                                update("account", "password", e.target.value)
                              }
                              placeholder={tr("account.passwordPlaceholder")}
                            />
                            <button
                              type="button"
                              aria-label={tr(
                                show ? "account.hide" : "account.show",
                              )}
                              onClick={() => setShow((v) => !v)}
                            >
                              {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </span>
                          {fieldError("password")}
                        </label>
                        <p className="ob-private-note">
                          <LockKeyhole size={15} />
                          {tr("accountNote")}
                        </p>
                      </>
                    ))}
                  {step === 1 && (
                    <>
                      <label className="ob-field">
                        {tr("activity.name")} *
                        <input
                          autoComplete="organization"
                          maxLength={100}
                          value={draft.business.name}
                          aria-invalid={!!errors.name}
                          onChange={(e) =>
                            update("business", "name", e.target.value)
                          }
                          placeholder={tr("activity.namePlaceholder")}
                        />
                        {fieldError("name")}
                      </label>
                      <label className="ob-field">
                        {tr("activity.category")} *
                        <select
                          value={draft.business.category}
                          aria-invalid={!!errors.category}
                          onChange={(e) =>
                            update("business", "category", e.target.value)
                          }
                        >
                          <option value="">
                            {tr("activity.categoryPlaceholder")}
                          </option>
                          {businessCategories.map((c) => (
                            <option key={c} value={c}>
                              {t(`categories.${c}`)}
                            </option>
                          ))}
                        </select>
                        {fieldError("category")}
                      </label>
                      <p className="ob-private-note">
                        <Sparkles size={15} />
                        {st("laterInStudio")}
                      </p>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <LocationFields
                        value={draft.contact.location}
                        onChange={(location) => {
                          setDraft((d) => ({
                            ...d,
                            contact: { ...d.contact, location },
                          }));
                          setErrors({});
                        }}
                      />
                      {fieldError("location")}
                      <label className="ob-field">
                        {tr("contact.phone")} *
                        <input
                          type="tel"
                          autoComplete="tel"
                          dir="ltr"
                          value={draft.contact.phone}
                          aria-invalid={!!errors.phone}
                          onChange={(e) =>
                            update("contact", "phone", e.target.value)
                          }
                          placeholder="0555 123 456"
                        />
                        {fieldError("phone")}
                      </label>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      {!connected && !draft.account.password && (
                        <label className="ob-field">
                          {tr("account.password")} *
                          <span className="ob-password">
                            <input
                              type={show ? "text" : "password"}
                              autoComplete="current-password"
                              minLength={8}
                              maxLength={128}
                              value={draft.account.password}
                              aria-invalid={!!errors.password}
                              onChange={(e) =>
                                update("account", "password", e.target.value)
                              }
                              placeholder={tr("account.passwordPlaceholder")}
                            />
                            <button
                              type="button"
                              aria-label={tr(
                                show ? "account.hide" : "account.show",
                              )}
                              onClick={() => setShow((v) => !v)}
                            >
                              {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </span>
                          {fieldError("password")}
                        </label>
                      )}
                      <div className="ob-review">
                        {[
                          {
                            title: tr("review.account"),
                            value: connected
                              ? session?.user?.email
                              : [draft.account.name, draft.account.email]
                                  .filter(Boolean)
                                  .join(" · "),
                            index: 0,
                          },
                          {
                            title: tr("review.activity"),
                            value: [
                              draft.business.name,
                              draft.business.category
                                ? t(`categories.${draft.business.category}`)
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" · "),
                            index: 1,
                          },
                          {
                            title: tr("review.contact"),
                            value: [
                              draft.contact.phone,
                              locationLabel(draft.contact.location, language),
                            ]
                              .filter(Boolean)
                              .join(" · "),
                            index: 2,
                          },
                        ].map((item) => (
                          <section className="ob-review-row" key={item.index}>
                            <div>
                              <h2>{item.title}</h2>
                              <strong>{item.value}</strong>
                            </div>
                            <button
                              type="button"
                              className="ob-text-button"
                              onClick={() => go(item.index)}
                            >
                              {tr("edit")}
                            </button>
                          </section>
                        ))}
                      </div>
                      <p className="ob-login-prompt">
                        {tr("login")}{" "}
                        <Link href="/auth/signin?callbackUrl=%2Fonboarding">
                          {tr("signIn")}
                        </Link>
                      </p>
                      <div className="ob-moderation">
                        <ShieldCheck size={23} />
                        <p>{tr("review.emailNote")}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {error && (
                <div className="ob-server-error" role="alert">
                  {tr(`errors.${error}`)}
                  {createdUrl && (
                    <Link
                      href={`/auth/signin?callbackUrl=${encodeURIComponent(createdUrl)}`}
                    >
                      {st("openStudio")}
                    </Link>
                  )}
                </div>
              )}
              <div className="ob-form-actions">
                {step ? (
                  <button
                    type="button"
                    className="ob-back"
                    onClick={() => go(step - 1)}
                  >
                    <Backward size={17} />
                    {tr("back")}
                  </button>
                ) : (
                  <span className="ob-no-card">
                    <ShieldCheck size={15} />
                    {tr("free")}
                  </span>
                )}
                <button type="submit" className="ob-primary">
                  {busy ? <Loader2 size={17} className="ob-spin" /> : null}
                  {busy
                    ? tr("creating")
                    : step === 3
                      ? tr("signIn")
                      : tr("next")}
                  <Forward size={17} />
                </button>
              </div>
              <p className="ob-form-footnote">{tr("required")}</p>
            </fieldset>
          </form>
        </main>
      </div>
    </div>
  );
}
