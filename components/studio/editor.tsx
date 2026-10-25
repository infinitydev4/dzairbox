"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCheck,
  CircleHelp,
  Eye,
  LayoutTemplate,
  Loader2,
  Monitor,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { BrandLogo } from "@/components/brand-logo";
import { businessCategories, daysOfWeek } from "@/lib/constants";
import { OptionPicker } from "@/components/option-picker";
import {
  studioDocumentSchema,
  palettes,
  normalizePhone,
  type SectionType,
  type StudioDocument,
} from "@/lib/studio/document";
import { StudioCanvas } from "./canvas";
import { StudioUpload } from "./upload";
import { LocationFields } from "./location-fields";
import { PointPicker } from "./point-picker";
import { trackEvent } from "@/lib/studio/events";
type Loaded = {
  document: StudioDocument;
  revision: number;
  publishedAt: string | null;
  submittedAt: string | null;
  emailVerified: boolean;
  stats: Record<string, number>;
  business: {
    id: string;
    subdomain: string;
    status: string;
    active: boolean;
    reason: string | null;
    profilePending: boolean;
    customPage: boolean;
  };
};
type SaveState = "saved" | "pending" | "saving" | "failed" | "conflict";
export function StudioEditor({ businessId }: { businessId: string }) {
  const { t, language, setLanguage } = useLanguage();
  const s = (k: string) => t(`studio.${k}`);
  const { data: session, update: updateSession } = useSession();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [doc, setDoc] = useState<StudioDocument | null>(null);
  const [section, setSection] = useState<SectionType | "design">("intro");
  const [contentLanguage, setContentLanguage] = useState<"fr" | "ar">("fr");
  const [state, setState] = useState<SaveState>("saved");
  const [loadingError, setLoadingError] = useState(false);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [history, setHistory] = useState<StudioDocument[]>([]);
  const [future, setFuture] = useState<StudioDocument[]>([]);
  const [localCopy, setLocalCopy] = useState<StudioDocument | null>(null);
  const [sent, setSent] = useState(false);
  const docRef = useRef<StudioDocument | null>(null);
  const revision = useRef(0);
  const lastSaved = useRef("");
  const inflight = useRef<Promise<void> | null>(null);
  const localKey = `dzairbox-studio-${businessId}`;
  const heading = useRef<HTMLHeadingElement>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/businesses/${businessId}/studio`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error();
      const data: Loaded = await r.json();
      setLoaded(data);
      setDoc(data.document);
      docRef.current = data.document;
      revision.current = data.revision;
      lastSaved.current = JSON.stringify(data.document);
      setContentLanguage(data.document.primaryLanguage);
      setState("saved");
      setHistory([]);
      setFuture([]);
      setLoadingError(false);
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const parsed = studioDocumentSchema.safeParse(JSON.parse(stored));
          if (
            parsed.success &&
            JSON.stringify(parsed.data) !== lastSaved.current
          )
            setLocalCopy(parsed.data);
        }
      } catch {}
    } catch {
      setLoadingError(true);
    }
  }, [businessId, localKey]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
      trackEvent("studio_open", businessId);
    }, 0);
    return () => clearTimeout(timer);
  }, [load, businessId]);
  const save = useCallback(
    async (publish = false) => {
      if (inflight.current) await inflight.current;
      const snapshot = docRef.current;
      if (!snapshot) return;
      const run = async () => {
        setState("saving");
        if (publish) setPublishing(true);
        try {
          const r = await fetch(`/api/businesses/${businessId}/studio`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              document: snapshot,
              expectedRevision: revision.current,
              publish,
            }),
          });
          const data = await r.json();
          if (!r.ok) {
            if (r.status === 409) {
              setState("conflict");
              return;
            }
            if (
              data.code === "INCOMPLETE" &&
              Array.isArray(data.details) &&
              data.details.length
            ) {
              const first =
                data.details[0] === "address" ? "location" : data.details[0];
              if (
                [
                  "intro",
                  "about",
                  "services",
                  "hours",
                  "location",
                  "contact",
                  "faq",
                ].includes(first)
              ) {
                setSection(first);
                setMobilePreview(false);
              }
            }
            setState("failed");
            setMessage(
              data.code === "EMAIL_UNVERIFIED"
                ? "emailGate"
                : data.code === "INCOMPLETE"
                  ? "incomplete"
                  : data.code === "SUSPENDED"
                    ? "suspended"
                    : data.code === "INVALID_DOCUMENT" ||
                        data.code === "INVALID_LOCATION"
                      ? "invalidDocument"
                      : "serverError",
            );
            return;
          }
          revision.current = data.revision;
          lastSaved.current = JSON.stringify(snapshot);
          const unchanged =
            JSON.stringify(docRef.current) === lastSaved.current;
          setState(unchanged ? "saved" : "pending");
          setMessage(publish ? (data.pending ? "submitted" : "published") : "");
          if (publish) {
            trackEvent("publication_request", businessId);
            setLoaded((prev) =>
              prev
                ? {
                    ...prev,
                    revision: data.revision,
                    business: {
                      ...prev.business,
                      customPage: data.published || prev.business.customPage,
                      profilePending: data.pending,
                    },
                    submittedAt: data.pending ? new Date().toISOString() : null,
                    publishedAt: data.published
                      ? new Date().toISOString()
                      : prev.publishedAt,
                  }
                : prev,
            );
          }
          try {
            if (unchanged) localStorage.removeItem(localKey);
          } catch {}
        } catch {
          setState("failed");
          setMessage("serverError");
        } finally {
          setPublishing(false);
        }
      };
      const pending = run();
      inflight.current = pending;
      await pending;
      inflight.current = null;
    },
    [businessId, localKey],
  );
  useEffect(() => {
    if (!doc || JSON.stringify(doc) === lastSaved.current) return;
    try {
      localStorage.setItem(localKey, JSON.stringify(doc));
    } catch {}
    if (state !== "pending") return;
    const timer = setTimeout(() => void save(), 900);
    return () => clearTimeout(timer);
  }, [doc, state, save, localKey]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (
        docRef.current &&
        JSON.stringify(docRef.current) !== lastSaved.current
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  function change(mutator: (d: StudioDocument) => void) {
    const before = docRef.current;
    if (!before) return;
    const next = structuredClone(before);
    mutator(next);
    setHistory((h) => [...h.slice(-39), before]);
    setFuture([]);
    docRef.current = next;
    setDoc(next);
    if (state !== "conflict") setState("pending");
    setMessage("");
  }
  function travel(redo = false) {
    const source = redo ? future : history;
    if (!source.length || !docRef.current) return;
    const target = source[source.length - 1];
    const current = docRef.current;
    if (redo) {
      setFuture(source.slice(0, -1));
      setHistory((h) => [...h, current]);
    } else {
      setHistory(source.slice(0, -1));
      setFuture((h) => [...h, current]);
    }
    docRef.current = target;
    setDoc(target);
    if (state !== "conflict") setState("pending");
  }
  function select(key: SectionType | "design") {
    setSection(key);
    setMobilePreview(false);
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }
  async function resend() {
    if (sent) return;
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user.email, language }),
      });
      if (response.ok) setSent(true);
      else setMessage("serverError");
    } catch {
      setMessage("serverError");
    }
  }
  async function refreshVerification() {
    try {
      await updateSession();
      const r = await fetch(`/api/businesses/${businessId}/studio`, {
        cache: "no-store",
      });
      if (r.ok) {
        const data = await r.json();
        setLoaded((prev) =>
          prev ? { ...prev, emailVerified: data.emailVerified } : prev,
        );
      } else setMessage("serverError");
    } catch {
      setMessage("serverError");
    }
  }

  function reorder(type: SectionType, offset: number) {
    change((d) => {
      const i = d.sections.findIndex((sec) => sec.type === type),
        j = i + offset;
      if (j >= 1 && j < d.sections.length)
        [d.sections[i], d.sections[j]] = [d.sections[j], d.sections[i]];
    });
  }
  if (!doc || !loaded)
    return (
      <div className="st-loading">
        {loadingError ? (
          <>
            <CircleHelp />
            <p>{s("serverError")}</p>
            <button onClick={() => void load()}>{s("retry")}</button>
          </>
        ) : (
          <>
            <Loader2 className="ob-spin" />
            <p>{s("studio")}</p>
          </>
        )}
      </div>
    );
  const checklist = [
    {
      key: "checkAbout",
      done: !!doc.content.about[doc.primaryLanguage],
      target: "about",
    },
    {
      key: "checkServices",
      done: doc.content.services.length > 0,
      target: "services",
    },
    {
      key: "checkMedia",
      done: !!doc.content.logo || !!doc.content.cover,
      target: "intro",
    },
    {
      key: "checkLocation",
      done: !!doc.profile.location.communeCode,
      target: "location",
    },
    { key: "checkVerify", done: loaded.emailVerified, target: "contact" },
  ];
  return (
    <div className="st-root" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="st-header">
        <Link href="/dashboard/businesses" className="st-brand">
          <BrandLogo priority alt="DzairBox" />
          <span className="st-brand-tag">{s("studio")}</span>
        </Link>
        <div className="st-header-middle">
          <strong>{doc.profile.name}</strong>
          <span className={`st-save-status st-status-${state}`} role="status">
            {state === "saving" ? (
              <Loader2 size={12} />
            ) : (
              <CheckCheck size={12} />
            )}{" "}
            {s(
              state === "saved"
                ? "saved"
                : state === "saving"
                  ? "saving"
                  : state === "failed"
                    ? "offline"
                    : state === "conflict"
                      ? "conflict"
                      : "saving",
            )}
          </span>
        </div>
        <div className="st-header-actions">
          <button
            className="st-icon"
            type="button"
            title={s("undo")}
            aria-label={s("undo")}
            disabled={!history.length}
            onClick={() => travel()}
          >
            <Undo2 size={17} />
          </button>
          <button
            className="st-icon"
            type="button"
            title={s("redo")}
            aria-label={s("redo")}
            disabled={!future.length}
            onClick={() => travel(true)}
          >
            <Redo2 size={17} />
          </button>
          <button
            className="st-icon st-save-manual"
            type="button"
            title={s("save")}
            aria-label={s("save")}
            disabled={state === "conflict" || state === "saving"}
            onClick={() => void save()}
          >
            <Save size={17} />
          </button>
          <button
            className="st-publish"
            type="button"
            disabled={
              publishing ||
              state === "conflict" ||
              !loaded.emailVerified ||
              loaded.business.status === "SUSPENDED"
            }
            onClick={() => void save(true)}
          >
            {publishing ? <Loader2 size={15} /> : <ArrowUp size={15} />}
            <span>
              {s(
                publishing
                  ? "publishing"
                  : loaded.business.active
                    ? "publish"
                    : "submit",
              )}
            </span>
          </button>
          <button
            type="button"
            className="st-language"
            onClick={() => setLanguage(language === "ar" ? "fr" : "ar")}
          >
            {language === "ar" ? "FR" : "ع"}
          </button>
        </div>
      </header>
      <div className="st-workspace">
        <aside className="st-rail">
          <Link className="st-back-link" href="/dashboard/businesses">
            <ArrowLeft size={14} />
            {s("back")}
          </Link>
          <div className="st-rail-title">
            <span>{s("checklist")}</span>
            <span>
              {checklist.filter((c) => c.done).length}/{checklist.length}
            </span>
          </div>
          <div className="st-progress">
            <span
              style={{
                width: `${(checklist.filter((c) => c.done).length / checklist.length) * 100}%`,
              }}
            />
          </div>
          <nav aria-label={s("studio")}>
            <button
              className={section === "design" ? "is-active" : ""}
              onClick={() => select("design")}
            >
              <LayoutTemplate size={16} />
              {s("design")}
            </button>
            {doc.sections.map((sec, index) => (
              <div className="st-nav-row" key={sec.type}>
                <button
                  className={section === sec.type ? "is-active" : ""}
                  onClick={() => select(sec.type)}
                >
                  <span className="st-nav-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {s(sec.type)}
                  {sec.enabled && <Check size={12} />}
                </button>
                {sec.type !== "intro" && (
                  <div className="st-section-order">
                    <button
                      type="button"
                      disabled={index <= 1}
                      aria-label={`${s("up")} ${s(sec.type)}`}
                      onClick={() => reorder(sec.type, -1)}
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={index === doc.sections.length - 1}
                      aria-label={`${s("down")} ${s(sec.type)}`}
                      onClick={() => reorder(sec.type, 1)}
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="st-guide">
            <Image
              src="/images/onboarding/sami-guide.webp"
              alt={t("onboarding.guideAlt")}
              width={80}
              height={120}
            />
            <div>
              <strong>
                <Sparkles size={12} />
                {s("guide")}
              </strong>
              <p>{s(`tip_${section}`)}</p>
            </div>
          </div>
          <div className="st-business-status">
            <i />
            {s(loaded.business.status)}
          </div>
          {loaded.business.active && (
            <Link
              className="st-link"
              href={`/${loaded.business.subdomain}`}
              target="_blank"
            >
              {s("publicPage")} ↗
            </Link>
          )}
        </aside>
        <div className={`st-panel ${mobilePreview ? "st-panel-hidden" : ""}`}>
          <div className="st-panel-heading">
            <span>{s("studio")}</span>
            <h1 tabIndex={-1} ref={heading}>
              {s(section)}
            </h1>
            <p>{s(`tip_${section}`)}</p>
            <Image
              className="st-mobile-sami"
              src="/images/onboarding/sami-guide.webp"
              alt={t("onboarding.guideAlt")}
              width={50}
              height={75}
            />
          </div>
          {loaded.business.reason && (
            <div className="st-notice">
              <strong>{s("reason")}</strong>
              <p>{loaded.business.reason}</p>
            </div>
          )}
          {!loaded.emailVerified && (
            <div className="st-notice st-verify">
              <MailIcon />
              <p>{s("emailGate")}</p>
              <button
                type="button"
                onClick={() => void resend()}
                disabled={sent}
              >
                {s(sent ? "sent" : "resend")}
              </button>
              <button type="button" onClick={() => void refreshVerification()}>
                {s("refreshVerification")}
              </button>
            </div>
          )}
          {localCopy && (
            <div className="st-notice">
              <p>{s("localDraft")}</p>
              <button
                type="button"
                onClick={() => {
                  const local = localCopy;
                  change((d) => Object.assign(d, local));
                  setLocalCopy(null);
                }}
              >
                {s("restoreLocal")}
              </button>
              <button
                type="button"
                aria-label={s("remove")}
                onClick={() => setLocalCopy(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {state === "conflict" && (
            <div className="st-error" role="alert">
              {s("conflict")}
              <button
                type="button"
                onClick={() => {
                  setLocalCopy(doc);
                  void load();
                }}
              >
                {s("reloadServer")}
              </button>
            </div>
          )}
          {message && (
            <div
              className={`st-notice ${["serverError", "incomplete", "invalidDocument", "suspended"].includes(message) ? "st-error" : ""}`}
              role="status"
            >
              {s(message)}
              {state === "failed" && (
                <button type="button" onClick={() => void save()}>
                  {s("retry")}
                </button>
              )}
            </div>
          )}
          <div className="st-form" key={section}>
            {section !== "design" && section !== "intro" && (
              <label className="st-toggle">
                <input
                  type="checkbox"
                  checked={
                    doc.sections.find((s) => s.type === section)?.enabled ||
                    false
                  }
                  onChange={(e) =>
                    change((d) => {
                      d.sections.find((s) => s.type === section)!.enabled =
                        e.target.checked;
                    })
                  }
                />
                {s("visible")}
              </label>
            )}
            {(
              ["intro", "about", "services", "gallery", "faq"] as string[]
            ).includes(section) && (
              <div className="st-content-language">
                <label>
                  {s("contentLanguage")}
                  <OptionPicker
                    label={s("contentLanguage")}
                    placeholder={s("contentLanguage")}
                    value={contentLanguage}
                    onValueChange={(language) =>
                      setContentLanguage(language as "fr" | "ar")
                    }
                    options={[
                      { value: "fr", label: "Français" },
                      { value: "ar", label: "العربية" },
                    ]}
                  />
                </label>
                <p>{s("translationOptional")}</p>
              </div>
            )}
            {section === "design" && (
              <>
                <fieldset>
                  <legend>{s("layout")}</legend>
                  <div className="st-layouts">
                    {(["panorama", "essential", "signature"] as const).map(
                      (layout) => (
                        <button
                          className={
                            doc.design.layout === layout ? "is-selected" : ""
                          }
                          key={layout}
                          type="button"
                          aria-pressed={doc.design.layout === layout}
                          onClick={() =>
                            change((d) => {
                              d.design.layout = layout;
                            })
                          }
                        >
                          <span className={`st-layout-mini st-mini-${layout}`}>
                            <i />
                            <i />
                            <i />
                          </span>
                          {s(layout)}
                          {doc.design.layout === layout && <Check size={14} />}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>{s("palette")}</legend>
                  <div className="st-palettes">
                    {(
                      Object.keys(palettes) as Array<keyof typeof palettes>
                    ).map((palette) => (
                      <button
                        aria-pressed={doc.design.palette === palette}
                        type="button"
                        key={palette}
                        onClick={() =>
                          change((d) => {
                            d.design.palette = palette;
                            d.design.colors = undefined;
                          })
                        }
                      >
                        <span style={{ background: palettes[palette][0] }}>
                          {doc.design.palette === palette && (
                            <Check size={13} />
                          )}
                        </span>
                        {s(palette)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  {s("font")}
                  <OptionPicker
                    label={s("font")}
                    placeholder={s("font")}
                    value={doc.design.font}
                    onValueChange={(font) =>
                      change((d) => {
                        d.design.font = font as StudioDocument["design"]["font"];
                      })
                    }
                    options={["modern", "humanist", "editorial"].map((font) => ({
                      value: font,
                      label: s(font),
                    }))}
                  />
                </label>
                <label>
                  {s("primaryLanguage")}
                  <OptionPicker
                    label={s("primaryLanguage")}
                    placeholder={s("primaryLanguage")}
                    value={doc.primaryLanguage}
                    onValueChange={(language) =>
                      change((d) => {
                        d.primaryLanguage = language as "fr" | "ar";
                      })
                    }
                    options={[
                      { value: "fr", label: "Français" },
                      { value: "ar", label: "العربية" },
                    ]}
                  />
                </label>
              </>
            )}
            {section === "intro" && (
              <>
                <label>
                  {s("name")}
                  <input
                    value={doc.profile.name}
                    maxLength={100}
                    onChange={(e) =>
                      change((d) => {
                        d.profile.name = e.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  {s("category")}
                  <OptionPicker
                    label={s("category")}
                    placeholder={s("category")}
                    value={doc.profile.category}
                    onValueChange={(category) =>
                      change((d) => {
                        d.profile.category = category;
                      })
                    }
                    options={[
                      ...(!businessCategories.some(
                        (category) => category === doc.profile.category,
                      ) && doc.profile.category
                        ? [
                            {
                              value: doc.profile.category,
                              label: doc.profile.category,
                            },
                          ]
                        : []),
                      ...businessCategories.map((category) => ({
                        value: category,
                        label: t(`categories.${category}`),
                      })),
                    ]}
                  />
                </label>
                <LocalizedInput
                  label={s("title")}
                  value={doc.content.title[contentLanguage]}
                  language={contentLanguage}
                  multiline={false}
                  onChange={(v) =>
                    change((d) => {
                      d.content.title[contentLanguage] = v;
                    })
                  }
                />
                <StudioUpload
                  businessId={businessId}
                  value={doc.content.logo}
                  label={s("logo")}
                  onChange={(url) =>
                    change((d) => {
                      d.content.logo = url;
                    })
                  }
                />
                <StudioUpload
                  businessId={businessId}
                  value={doc.content.cover}
                  label={s("cover")}
                  onChange={(url) =>
                    change((d) => {
                      d.content.cover = url;
                    })
                  }
                />
                <p className="st-help">{s("sensitive")}</p>
              </>
            )}
            {section === "about" && (
              <LocalizedInput
                label={s("description")}
                value={doc.content.about[contentLanguage]}
                language={contentLanguage}
                multiline
                onChange={(v) =>
                  change((d) => {
                    d.content.about[contentLanguage] = v;
                  })
                }
              />
            )}
            {section === "services" && (
              <>
                {doc.content.services.map((service, index) => (
                  <fieldset className="st-item" key={service.id}>
                    <legend>
                      {s("services")} {index + 1}
                    </legend>
                    <button
                      className="st-item-remove"
                      type="button"
                      aria-label={s("remove")}
                      onClick={() =>
                        change((d) => {
                          d.content.services.splice(index, 1);
                        })
                      }
                    >
                      <X size={15} />
                    </button>
                    <LocalizedInput
                      label={s("serviceTitle")}
                      value={service.title[contentLanguage]}
                      language={contentLanguage}
                      multiline={false}
                      onChange={(v) =>
                        change((d) => {
                          d.content.services[index].title[contentLanguage] = v;
                        })
                      }
                    />
                    <LocalizedInput
                      label={s("description")}
                      value={service.description[contentLanguage]}
                      language={contentLanguage}
                      multiline={true}
                      onChange={(v) =>
                        change((d) => {
                          d.content.services[index].description[
                            contentLanguage
                          ] = v;
                        })
                      }
                    />
                    <div className="st-form-grid">
                      <label>
                        {s("priceMode")}
                        <OptionPicker
                          label={s("priceMode")}
                          placeholder={s("priceMode")}
                          value={service.priceMode}
                          onValueChange={(mode) =>
                            change((d) => {
                              d.content.services[index].priceMode = mode as
                                | "quote"
                                | "fixed"
                                | "from";
                            })
                          }
                          options={["quote", "fixed", "from"].map((mode) => ({
                            value: mode,
                            label: s(mode),
                          }))}
                        />
                      </label>
                      {service.priceMode !== "quote" && (
                        <label>
                          {s("price")}
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={service.price ?? ""}
                            onChange={(e) =>
                              change((d) => {
                                d.content.services[index].price =
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value);
                              })
                            }
                          />
                        </label>
                      )}
                    </div>
                    <StudioUpload
                      businessId={businessId}
                      value={service.image}
                      label={s("image")}
                      onChange={(url) =>
                        change((d) => {
                          d.content.services[index].image = url;
                        })
                      }
                    />
                  </fieldset>
                ))}
                <button
                  className="st-add"
                  type="button"
                  onClick={() =>
                    change((d) => {
                      d.content.services.push({
                        id: crypto.randomUUID(),
                        title: { fr: "", ar: "" },
                        description: { fr: "", ar: "" },
                        image: "",
                        priceMode: "quote",
                        price: null,
                      });
                    })
                  }
                >
                  <Plus size={16} />
                  {s("addService")}
                </button>
              </>
            )}
            {section === "gallery" && (
              <>
                {doc.content.gallery.map((photo, index) => (
                  <fieldset key={photo.id} className="st-item">
                    <legend>
                      {s("image")} {index + 1}
                    </legend>
                    <StudioUpload
                      businessId={businessId}
                      value={photo.url}
                      label={s("image")}
                      onChange={(url) =>
                        change((d) => {
                          d.content.gallery[index].url = url;
                        })
                      }
                    />
                    <LocalizedInput
                      label={s("alt")}
                      value={photo.alt[contentLanguage]}
                      language={contentLanguage}
                      multiline={false}
                      onChange={(v) =>
                        change((d) => {
                          d.content.gallery[index].alt[contentLanguage] = v;
                        })
                      }
                    />
                    <div className="st-item-actions">
                      <button
                        disabled={index === 0}
                        type="button"
                        onClick={() =>
                          change((d) => {
                            [
                              d.content.gallery[index - 1],
                              d.content.gallery[index],
                            ] = [
                              d.content.gallery[index],
                              d.content.gallery[index - 1],
                            ];
                          })
                        }
                      >
                        {s("up")}
                      </button>
                      <button
                        disabled={index === doc.content.gallery.length - 1}
                        type="button"
                        onClick={() =>
                          change((d) => {
                            [
                              d.content.gallery[index + 1],
                              d.content.gallery[index],
                            ] = [
                              d.content.gallery[index],
                              d.content.gallery[index + 1],
                            ];
                          })
                        }
                      >
                        {s("down")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          change((d) => {
                            d.content.gallery.splice(index, 1);
                          })
                        }
                      >
                        {s("remove")}
                      </button>
                    </div>
                  </fieldset>
                ))}
                <StudioUpload
                  businessId={businessId}
                  value=""
                  label={s("addPhoto")}
                  onChange={(url) =>
                    change((d) => {
                      d.content.gallery.push({
                        id: crypto.randomUUID(),
                        url,
                        alt: { fr: "", ar: "" },
                      });
                      d.sections.find((s) => s.type === "gallery")!.enabled =
                        true;
                    })
                  }
                />
              </>
            )}
            {section === "hours" && (
              <>
                <div className="st-segment">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      aria-pressed={doc.content.appointmentOnly === value}
                      onClick={() =>
                        change((d) => {
                          d.content.appointmentOnly = value;
                        })
                      }
                    >
                      {s(value ? "appointment" : "regular")}
                    </button>
                  ))}
                </div>
                {!doc.content.appointmentOnly && (
                  <>
                    {daysOfWeek.map((day) => {
                      const h = doc.content.hours[day.key];
                      return (
                        <div className="st-hour-row" key={day.key}>
                          <label>
                            <input
                              type="checkbox"
                              checked={!h.closed}
                              onChange={(e) =>
                                change((d) => {
                                  d.content.hours[day.key].closed =
                                    !e.target.checked;
                                })
                              }
                            />
                            {language === "ar" ? day.labelAr : day.labelFr}
                          </label>
                          {h.closed ? (
                            <span>{s("closed")}</span>
                          ) : (
                            <div>
                              <input
                                type="time"
                                aria-label={`${s("open")} ${language === "ar" ? day.labelAr : day.labelFr}`}
                                value={h.open}
                                onChange={(e) =>
                                  change((d) => {
                                    d.content.hours[day.key].open =
                                      e.target.value;
                                  })
                                }
                              />
                              <span>–</span>
                              <input
                                type="time"
                                aria-label={`${s("close")} ${language === "ar" ? day.labelAr : day.labelFr}`}
                                value={h.close}
                                onChange={(e) =>
                                  change((d) => {
                                    d.content.hours[day.key].close =
                                      e.target.value;
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      className="st-link"
                      type="button"
                      onClick={() =>
                        change((d) => {
                          for (const day of Object.values(d.content.hours)) {
                            day.open = d.content.hours.sunday.open;
                            day.close = d.content.hours.sunday.close;
                          }
                        })
                      }
                    >
                      {s("applyHours")}
                    </button>
                  </>
                )}
              </>
            )}
            {section === "location" && (
              <>
                <LocationFields
                  value={doc.profile.location}
                  multiple
                  onChange={(location) =>
                    change((d) => {
                      d.profile.location = location;
                    })
                  }
                />
                <PointPicker
                  location={doc.profile.location}
                  onChange={(location) =>
                    change((d) => {
                      d.profile.location = location;
                    })
                  }
                />
                <p className="st-help">{s("sensitive")}</p>
              </>
            )}
            {section === "contact" && (
              <>
                <label>
                  {s("phone")}
                  <input
                    type="tel"
                    dir="ltr"
                    value={doc.profile.phone}
                    onChange={(e) =>
                      change((d) => {
                        d.profile.phone = e.target.value;
                      })
                    }
                    onBlur={() =>
                      change((d) => {
                        d.profile.phone = normalizePhone(d.profile.phone);
                      })
                    }
                  />
                </label>
                <label>
                  {s("whatsapp")}
                  <input
                    type="tel"
                    dir="ltr"
                    value={doc.content.whatsapp}
                    placeholder="+213…"
                    onChange={(e) =>
                      change((d) => {
                        d.content.whatsapp = e.target.value;
                      })
                    }
                    onBlur={() => {
                      if (doc.content.whatsapp)
                        change((d) => {
                          d.content.whatsapp = normalizePhone(
                            d.content.whatsapp,
                          );
                        });
                    }}
                  />
                </label>
                <label>
                  {s("email")}
                  <input
                    type="email"
                    dir="ltr"
                    value={doc.content.email}
                    onChange={(e) =>
                      change((d) => {
                        d.content.email = e.target.value;
                      })
                    }
                  />
                </label>
                {(["facebook", "instagram", "tiktok", "youtube"] as const).map(
                  (social) => (
                    <label key={social}>
                      {social}
                      <input
                        type="url"
                        dir="ltr"
                        value={doc.content.socials[social]}
                        placeholder={`https://${social}.com/…`}
                        onChange={(e) =>
                          change((d) => {
                            d.content.socials[social] = e.target.value;
                          })
                        }
                      />
                    </label>
                  ),
                )}
              </>
            )}
            {section === "faq" && (
              <>
                {doc.content.faq.map((item, index) => (
                  <fieldset className="st-item" key={item.id}>
                    <legend>
                      {s("question")} {index + 1}
                    </legend>
                    <button
                      type="button"
                      className="st-item-remove"
                      aria-label={s("remove")}
                      onClick={() =>
                        change((d) => {
                          d.content.faq.splice(index, 1);
                        })
                      }
                    >
                      <X size={15} />
                    </button>
                    <LocalizedInput
                      label={s("question")}
                      value={item.question[contentLanguage]}
                      language={contentLanguage}
                      multiline={false}
                      onChange={(v) =>
                        change((d) => {
                          d.content.faq[index].question[contentLanguage] = v;
                        })
                      }
                    />
                    <LocalizedInput
                      label={s("answer")}
                      value={item.answer[contentLanguage]}
                      language={contentLanguage}
                      multiline={true}
                      onChange={(v) =>
                        change((d) => {
                          d.content.faq[index].answer[contentLanguage] = v;
                        })
                      }
                    />
                  </fieldset>
                ))}
                <button
                  className="st-add"
                  type="button"
                  onClick={() =>
                    change((d) => {
                      d.content.faq.push({
                        id: crypto.randomUUID(),
                        question: { fr: "", ar: "" },
                        answer: { fr: "", ar: "" },
                      });
                      d.sections.find((s) => s.type === "faq")!.enabled = true;
                    })
                  }
                >
                  <Plus size={16} />
                  {s("addFaq")}
                </button>
              </>
            )}
          </div>
          <div className="st-panel-bottom">
            <button
              className="st-secondary"
              type="button"
              disabled={state === "conflict" || state === "saving"}
              onClick={() => void save()}
            >
              <Save size={14} />
              {s("save")}
            </button>
            <button
              type="button"
              className="st-mobile-toggle"
              onClick={() => setMobilePreview(true)}
            >
              <Eye size={15} />
              {s("preview")}
            </button>
          </div>
        </div>
        <div className={`st-preview ${mobilePreview ? "st-preview-open" : ""}`}>
          <div className="st-preview-toolbar">
            <span>
              <span className="st-live-dot" />
              {s("privatePreview")}
            </span>
            <div>
              <button
                aria-label={s("desktop")}
                aria-pressed={viewport === "desktop"}
                onClick={() => setViewport("desktop")}
              >
                <Monitor size={16} />
              </button>
              <button
                aria-label={s("mobile")}
                aria-pressed={viewport === "mobile"}
                onClick={() => setViewport("mobile")}
              >
                <Smartphone size={16} />
              </button>
              <button
                className="st-mobile-toggle"
                onClick={() => setMobilePreview(false)}
              >
                <X size={17} />
                {s("edit")}
              </button>
            </div>
          </div>
          <div className={`st-preview-scroll st-viewport-${viewport}`}>
            <StudioCanvas
              document={doc}
              businessId={businessId}
              language={contentLanguage}
              onSelect={select}
              selected={section}
            />
          </div>
          <div className="st-preview-bottom">
            {checklist.map((item) => (
              <button
                type="button"
                key={item.key}
                className={item.done ? "is-done" : ""}
                onClick={() => select(item.target as SectionType)}
              >
                {item.done ? <Check size={11} /> : <span />}
                {s(item.key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function MailIcon() {
  return <Sparkles size={18} />;
}

function LocalizedInput({
  label,
  value,
  language,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  language: "fr" | "ar";
  multiline: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          rows={5}
          value={value}
          dir={language === "ar" ? "rtl" : "ltr"}
          maxLength={2000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          dir={language === "ar" ? "rtl" : "ltr"}
          maxLength={2000}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
