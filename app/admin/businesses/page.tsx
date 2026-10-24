"use client";
import { categoryLabel } from "@/lib/category-label";
import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, ShieldCheck, Store } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { studioDocumentSchema } from "@/lib/studio/document";
import { StudioCanvas } from "@/components/studio/canvas";
import "@/app/studio.css";
type Row = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  moderationStatus: string;
  moderationReason: string | null;
  profileDraft: unknown;
  isActive: boolean;
  user: { name: string; email: string; emailVerified?: string | null } | null;
  pageConfig?: { submitted: unknown } | null;
};
export default function BusinessModeration() {
  const { t, language } = useLanguage();
  const s = (k: string) => t(`studio.${k}`);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/businesses");
      if (!r.ok) throw new Error();
      setRows(await r.json());
      setError("");
    } catch {
      setError("serverError");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  async function act(row: Row, action: string) {
    const reason = action === "approve" ? "" : window.prompt(s("reasonPrompt"));
    if (reason === null || (action !== "approve" && !reason.trim())) return;
    setBusy(row.id);
    try {
      const r = await fetch(`/api/admin/businesses/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(
          data.code === "EMAIL_UNVERIFIED" ? "emailGate" : "serverError",
        );
        return;
      }
      await load();
    } catch {
      setError("serverError");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="moderation-root">
      <div className="activities-heading">
        <div>
          <p>DzairBox · Administration</p>
          <h1>{s("moderation")}</h1>
        </div>
        <span>
          {
            rows.filter(
              (r) => r.moderationStatus === "PENDING" || r.profileDraft,
            ).length
          }{" "}
          {s("pending")}
        </span>
      </div>
      {error && (
        <div className="st-error" role="alert">
          {s(error)}
          <button onClick={() => void load()}>{s("retry")}</button>
        </div>
      )}
      {loading ? (
        <Loader2 className="ob-spin" />
      ) : (
        <div className="moderation-list">
          {rows.map((row) => {
            const submitted = studioDocumentSchema.safeParse(
              row.pageConfig?.submitted,
            );
            return (
              <article key={row.id} className="moderation-item">
                <div className="moderation-item-top">
                  <div>
                    <Store size={21} />
                    <h2>{row.name}</h2>
                    <span>{s(row.moderationStatus)}</span>
                  </div>
                  <div>{row.user?.email}</div>
                </div>
                <p>
                  {categoryLabel(row.category, language)} · {row.address}
                </p>
                {!!row.profileDraft && (
                  <div className="moderation-compare">
                    <div>
                      <strong>{s("currentProfile")}</strong>
                      <p>{row.name}</p>
                      <p>{row.phone}</p>
                      <p>{row.address}</p>
                    </div>
                    <div>
                      <strong>{s("submittedProfile")}</strong>
                      <pre>{JSON.stringify(row.profileDraft, null, 2)}</pre>
                    </div>
                  </div>
                )}
                {row.moderationReason && (
                  <p className="st-notice">{row.moderationReason}</p>
                )}
                {submitted.success && (
                  <details className="moderation-preview">
                    <summary>
                      {s("preview")}
                      <ChevronDown size={16} />
                    </summary>
                    <StudioCanvas
                      document={submitted.data}
                      businessId={row.id}
                      language={language}
                    />
                  </details>
                )}
                <div className="moderation-actions">
                  {(!row.isActive || !!row.profileDraft) && (
                    <button
                      className="st-publish"
                      type="button"
                      disabled={busy === row.id}
                      onClick={() => void act(row, "approve")}
                    >
                      <Check size={14} />
                      {s("approve")}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === row.id}
                    onClick={() => void act(row, "changes")}
                  >
                    {s("changes")}
                  </button>
                  <button
                    type="button"
                    disabled={busy === row.id}
                    onClick={() =>
                      void act(row, row.isActive ? "suspend" : "reject")
                    }
                  >
                    <ShieldCheck size={14} />
                    {s(row.isActive ? "suspend" : "reject")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
