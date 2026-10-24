"use client";
import { categoryLabel } from "@/lib/category-label";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Map,
  Search,
  List,
  LocateFixed,
  Phone,
  Store,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { businessCategories } from "@/lib/constants";
import wilayas from "@/data/locations/wilayas.json";
import { LocalHeader } from "./header";
import type { searchDirectory } from "@/lib/studio/directory";
import { trackEvent } from "@/lib/studio/events";
const BusinessMap = dynamic(() => import("./directory-map"), {
  ssr: false,
  loading: () => (
    <div className="directory-map-loading">
      <Loader2 className="ob-spin" />
    </div>
  ),
});
type Results = Awaited<ReturnType<typeof searchDirectory>>;
export function DirectoryExperience({
  result,
  query,
  error = false,
}: {
  result: Results;
  query: Record<string, string>;
  error?: boolean;
}) {
  const { t, language } = useLanguage();
  const s = (k: string) => t(`studio.${k}`);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query.q || query.search || "");
  const [mode, setMode] = useState(query.view === "map" ? "map" : "list");
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [visitor, setVisitor] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState(false);
  const [communes, setCommunes] = useState<
    Array<{ code: string; fr: string; ar: string }>
  >([]);
  function navigate(change: Record<string, string>, reset = true) {
    const params = new URLSearchParams(query);
    params.set("q", q);
    params.delete("search");
    if (reset) params.delete("page");
    for (const [key, value] of Object.entries(change)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() =>
      router.push(`/businesses?${params.toString()}`, { scroll: false }),
    );
  }
  function loadCommunes(code: string) {
    if (code)
      void fetch(`/api/locations?wilaya=${code}`)
        .then((r) => r.json())
        .then((data) => setCommunes(data.communes))
        .catch(() => setCommunes([]));
  }
  // Fetch dependent choices only after hydration, without loading the full country into the client.
  useEffect(() => {
    loadCommunes(query.wilaya || "");
  }, [query.wilaya]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    if (selectedRef.current)
      document
        .getElementById(`business-${selectedRef.current}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [result.page]);
  function aroundMe() {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setVisitor(point);
        setGeoError(false);
        navigate({
          lat: String(point.lat),
          lng: String(point.lng),
          wilaya: "",
          commune: "",
        });
      },
      () => setGeoError(true),
      { timeout: 10000 },
    );
  }
  return (
    <div
      className="dz-home directory-root"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <LocalHeader />
      <main className="directory-main">
        <div className="directory-heading">
          <div>
            <p>
              <span />
              DzairBox · {s("directory")}
            </p>
            <h1>{s("directory")}</h1>
          </div>
          <p>{t("home.hero.description")}</p>
        </div>
        <form
          className="directory-search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({});
          }}
        >
          <Search size={22} />
          <label className="sr-only" htmlFor="directory-query">
            {s("search")}
          </label>
          <input
            id="directory-query"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s("search")}
          />
          <button type="submit">
            {pending ? (
              <Loader2 size={16} className="ob-spin" />
            ) : (
              s("searchButton")
            )}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="directory-filters">
          <label>
            <span className="sr-only">{s("category")}</span>
            <select
              value={query.category || ""}
              onChange={(e) => navigate({ category: e.target.value })}
            >
              <option value="">{s("allCategories")}</option>
              {businessCategories.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{s("wilaya")}</span>
            <select
              value={query.wilaya || ""}
              onChange={(e) =>
                navigate({
                  wilaya: e.target.value,
                  commune: "",
                  lat: "",
                  lng: "",
                })
              }
            >
              <option value="">{s("allWilayas")}</option>
              {wilayas.map((w) => (
                <option key={w.code} value={String(w.code).padStart(2, "0")}>
                  {language === "ar" ? w.name_ar : w.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{s("commune")}</span>
            <select
              value={query.commune || ""}
              disabled={!query.wilaya}
              onChange={(e) => navigate({ commune: e.target.value })}
            >
              <option value="">{s("allCommunes")}</option>
              {communes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c[language]}
                </option>
              ))}
            </select>
          </label>
          <button className="directory-nearby" type="button" onClick={aroundMe}>
            <LocateFixed size={15} />
            {s("nearby")}
          </button>
        </div>
        {geoError && (
          <p className="directory-notice" role="status">
            {s("locationDenied")}
          </p>
        )}
        <div className="directory-results-bar">
          <p>
            <strong>{result.total}</strong> {s("results")}
          </p>
          <div>
            {Object.keys(query).some(
              (k) => query[k] && !["page", "view"].includes(k),
            ) && (
              <Link className="directory-reset" href="/businesses">
                {s("reset")}
              </Link>
            )}
            <button
              type="button"
              aria-pressed={mode === "list"}
              onClick={() => {
                setMode("list");
                navigate({ view: "list" }, false);
              }}
            >
              <List size={16} />
              {s("list")}
            </button>
            <button
              type="button"
              aria-pressed={mode === "map"}
              onClick={() => {
                setMode("map");
                navigate({ view: "map" }, false);
              }}
            >
              <Map size={16} />
              {s("map")}
            </button>
          </div>
        </div>
        {error && (
          <div className="directory-notice" role="alert">
            {s("serverError")}
            <button onClick={() => router.refresh()}>{s("retry")}</button>
          </div>
        )}
        <div
          className={`directory-results ${mode === "map" ? "directory-with-map" : ""}`}
          aria-busy={pending}
        >
          <div>
            <div className="directory-grid">
              {result.items.map((b) => (
                <article
                  className={`directory-card ${selected === b.id ? "is-selected" : ""}`}
                  key={b.id}
                  id={`business-${b.id}`}
                  onMouseEnter={() => setSelected(b.id)}
                >
                  <Link
                    href={`/${b.subdomain}`}
                    className="directory-card-image"
                  >
                    <DirectoryImage
                      src={b.heroImage}
                      name={b.name}
                      category={categoryLabel(b.category, language)}
                    />
                    <span className="directory-category">
                      {categoryLabel(b.category, language)}
                    </span>
                  </Link>
                  <div className="directory-card-copy">
                    <Link href={`/${b.subdomain}`}>
                      <h2>{b.name}</h2>
                      <ArrowUpRight size={19} />
                    </Link>
                    <p className="directory-card-location">
                      <MapPin size={13} />
                      {b.address}
                    </p>
                    {b.location.mode === "area" && (
                      <span className="directory-area">{s("areaBadge")}</span>
                    )}
                    <p className="directory-card-description">
                      {b.description}
                    </p>
                    <div className="directory-card-footer">
                      <Link href={`/${b.subdomain}`}>
                        {s("discover")}
                        <ArrowRight size={14} />
                      </Link>
                      {b.phone && (
                        <a
                          href={`tel:${b.phone}`}
                          aria-label={`${s("call")} ${b.name}`}
                          onClick={() => trackEvent("call", b.id)}
                        >
                          <Phone size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!result.items.length && !error && (
              <div className="directory-empty">
                <Search size={32} strokeWidth={1} />
                <p>{s("noResults")}</p>
                <Link href="/businesses">{s("reset")}</Link>
              </div>
            )}
            <nav className="directory-pagination" aria-label="Pagination">
              <button
                disabled={result.page <= 1 || pending}
                onClick={() =>
                  navigate({ page: String(result.page - 1) }, false)
                }
              >
                <ArrowLeft size={15} />
                {s("previous")}
              </button>
              <span>
                {result.page} / {result.pages}
              </span>
              <button
                disabled={result.page >= result.pages || pending}
                onClick={() =>
                  navigate({ page: String(result.page + 1) }, false)
                }
              >
                {s("next")}
                <ArrowRight size={15} />
              </button>
            </nav>
          </div>
          {mode === "map" && (
            <aside className="directory-map-side">
              <BusinessMap
                entries={result.markers}
                selected={selected}
                visitor={visitor}
                onSelect={(id) => {
                  setSelected(id);
                  const marker = result.markers.find(
                    (marker) => marker.id === id,
                  );
                  if (marker && marker.page !== result.page)
                    navigate({ page: String(marker.page) }, false);
                  document
                    .getElementById(`business-${id}`)
                    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                }}
              />
              {result.mapLimited && (
                <p className="directory-notice">{s("refineMap")}</p>
              )}
            </aside>
          )}
        </div>
      </main>
      <footer className="local-footer">
        <Link className="st-brand" href="/">
          Dzair<span>Box</span>
        </Link>
        <span>{t("home.footer.description")}</span>
        <Link href="/onboarding">{s("create")} ↗</Link>
        <Link href="/privacy">{s("privacy")}</Link>
      </footer>
    </div>
  );
}

function DirectoryImage({
  src,
  name,
  category,
}: {
  src: string | null;
  name: string;
  category: string;
}) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <Image
      src={src}
      alt={name}
      fill
      unoptimized
      sizes="(max-width:600px) 90vw,400px"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="directory-image-placeholder">
      <Store size={46} strokeWidth={0.8} />
      <span>{category}</span>
    </div>
  );
}
