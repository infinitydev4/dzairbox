"use client";
import { categoryLabel } from "@/lib/category-label";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Eye,
  Loader2,
  MapPin,
  MousePointerClick,
  Plus,
  Store,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useSession } from "next-auth/react";
type Activity = {
  id: string;
  name: string;
  category: string;
  address: string;
  isActive: boolean;
  subdomain: string;
  moderationStatus: string;
  profileDraft: unknown;
  useCustomPage: boolean;
  moderationReason: string | null;
  stats?: Record<string, number>;
};
export function Activities() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const s = (k: string) => t(`studio.${k}`);
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/businesses", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setItems(data);
        setError(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [attempt]);
  return (
    <div className="activities-root">
      <div className="activities-heading">
        <div>
          <p>DzairBox · {s("last30")}</p>
          <h1>{s("myActivities")}</h1>
        </div>
        <Link className="local-create" href="/onboarding">
          <Plus size={16} />
          {s("create")}
        </Link>
      </div>
      {session?.user && !session.user.emailVerified && (
        <div className="st-notice">{s("emailGate")}</div>
      )}
      {loading ? (
        <div className="st-loading">
          <Loader2 className="ob-spin" />
        </div>
      ) : error ? (
        <div className="st-error">
          {s("serverError")}
          <button onClick={() => setAttempt((n) => n + 1)}>{s("retry")}</button>
        </div>
      ) : !items.length ? (
        <div className="activities-empty">
          <Store size={45} strokeWidth={1} />
          <p>{s("noActivities")}</p>
          <Link className="st-publish" href="/onboarding">
            {s("create")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="activities-grid">
          {items.map((b) => {
            const contacts = [
              "call",
              "email",
              "whatsapp",
              "directions",
              "social",
            ].reduce((n, key) => n + (b.stats?.[key] || 0), 0);
            return (
              <article className="activity-card" key={b.id}>
                <div className="activity-card-top">
                  <span>
                    <Store size={24} strokeWidth={1} />
                  </span>
                  <span
                    className={`activity-status ${b.isActive ? "is-active" : ""}`}
                  >
                    {b.isActive && <Check size={11} />}{" "}
                    {s(b.moderationStatus || "PENDING")}
                  </span>
                </div>
                <span className="activity-category">
                  {categoryLabel(b.category, language)}
                </span>
                <h2>{b.name}</h2>
                <p className="activity-location">
                  <MapPin size={13} />
                  {b.address}
                </p>
                <div className="activity-stats">
                  <div>
                    <Eye size={16} />
                    <strong>{b.stats?.view || 0}</strong>
                    <span>{s("views")}</span>
                  </div>
                  <div>
                    <MousePointerClick size={16} />
                    <strong>{contacts}</strong>
                    <span>{s("contacts")}</span>
                  </div>
                </div>
                <p className="activity-page-status">
                  {s(
                    b.profileDraft
                      ? "profilePending"
                      : b.useCustomPage
                        ? "published"
                        : "draft",
                  )}
                </p>
                {b.moderationReason && (
                  <div className="st-notice">{b.moderationReason}</div>
                )}
                <div className="activity-card-actions">
                  <Link href={`/dashboard/businesses/${b.id}/studio`}>
                    {s("openStudio")}
                    <ArrowUpRight size={16} />
                  </Link>
                  {b.isActive && (
                    <Link
                      href={`/${b.subdomain}`}
                      target="_blank"
                      aria-label={`${s("publicPage")} ${b.name}`}
                    >
                      <Eye size={18} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="activities-stats-help">{s("statsHelp")}</p>
    </div>
  );
}
