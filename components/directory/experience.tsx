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
  SlidersHorizontal,
  X,
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
  const mode = query.view === "map" ? "map" : "list";
  const [hovered, setHovered] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDialog = useRef<HTMLDialogElement>(null);
  const searchValue = query.q || query.search || "";
  const [previousSearch, setPreviousSearch] = useState(searchValue);
  if (previousSearch !== searchValue) {
    setPreviousSearch(searchValue);
    setQ(searchValue);
  }

  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const activeEntry = result.markers.find((entry) => entry.id === selected);
  const [visitor, setVisitor] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState(false);
  const [communeWilaya, setCommuneWilaya] = useState("");
  const [communes, setCommunes] = useState<
    Array<{ code: string; fr: string; ar: string }>
  >([]);
  function navigate(change: Record<string, string>, reset = true) {
    const params = new URLSearchParams(query);
    params.set("q", q);
    params.delete("search");
    if (reset) {
      params.delete("page");
      setSelected(null);
    }
    for (const [key, value] of Object.entries(change)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() =>
      router.push(`/businesses?${params.toString()}`, { scroll: false }),
    );
  }
  useEffect(() => {
    if (mode !== "map") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);
  // Abort previous requests so rapid filter changes cannot restore stale communes.
  useEffect(() => {
    if (!query.wilaya) return;
    const controller = new AbortController();
    fetch(`/api/locations?wilaya=${query.wilaya}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setCommunes(data.communes);
          setCommuneWilaya(query.wilaya);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCommunes([]);
          setCommuneWilaya(query.wilaya);
        }
      });
    return () => controller.abort();
  }, [query.wilaya]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    if (selectedRef.current && window.matchMedia("(min-width: 751px)").matches)
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
  const filters = (
    <div className="directory-filters">
      <label>
        <span className="sr-only">{s("category")}</span>
        <select
          aria-label={s("category")}
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
          aria-label={s("wilaya")}
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
          aria-label={s("commune")}
          value={query.commune || ""}
          disabled={!query.wilaya || communeWilaya !== query.wilaya}
          onChange={(e) => navigate({ commune: e.target.value })}
        >
          <option value="">{s("allCommunes")}</option>
          {(communeWilaya === query.wilaya ? communes : []).map((c) => (
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
  );
  return (
    <div
      className={`dz-home directory-root ${mode === "map" ? "directory-map-mode" : ""}`}
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
          {mode === "map" && (
            <button
              className="directory-map-back"
              type="button"
              aria-label={s("showList")}
              onClick={() => navigate({ view: "list" }, false)}
            >
              <ArrowLeft size={19} />
            </button>
          )}
          <Search className="directory-search-icon" size={22} />
          <label className="sr-only" htmlFor="directory-query">
            {s("search")}
          </label>
          <input
            id="directory-query"
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s("search")}
          />
          <button
            type="submit"
            className="directory-search-submit"
            aria-label={s("searchButton")}
          >
            {pending ? (
              <Loader2 size={16} className="ob-spin" />
            ) : (
              <span>{s("searchButton")}</span>
            )}
            <ArrowRight size={16} />
          </button>
          {mode === "map" && (
            <button
              className="directory-map-filter-toggle"
              type="button"
              aria-label={s("filters")}
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              onClick={() => {
                setFiltersOpen(true);
                filterDialog.current?.showModal();
              }}
            >
              <SlidersHorizontal size={20} />
            </button>
          )}
        </form>
        {filters}
        {mode === "map" && (
          <dialog
            className="directory-filter-dialog"
            ref={filterDialog}
            aria-labelledby="directory-filter-title"
            onClose={() => setFiltersOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget)
                event.currentTarget.close();
            }}
          >
            <header>
              <h2 id="directory-filter-title">{s("filters")}</h2>
              <button
                type="button"
                aria-label={s("closeMapPanel")}
                onClick={() => filterDialog.current?.close()}
              >
                <X size={20} />
              </button>
            </header>
            {filtersOpen && filters}
            <button
              className="directory-filter-apply"
              type="button"
              onClick={() => filterDialog.current?.close()}
            >
              {s("applyFilters")}
            </button>
          </dialog>
        )}
        {geoError && (
          <p className="directory-notice" role="status">
            {s("locationDenied")}
          </p>
        )}
        <div className="directory-results-bar">
          <p>
            <strong>{result.total}</strong> {s("results")}
            {mode === "map" && (
              <span className="directory-map-coverage">
                {" "}
                · {result.markers.length} {s("mapPins")}
              </span>
            )}
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
          <div className="directory-list-panel">
            <div className="directory-grid">
              {result.items.map((b) => (
                <article
                  className={`directory-card ${selected === b.id ? "is-selected" : ""}`}
                  key={b.id}
                  id={`business-${b.id}`}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(b.id)}
                  onBlur={() => setHovered(null)}
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
                selected={hovered || selected}
                visitor={visitor}
                onSelect={(id) => {
                  setSelected(id);
                  setHovered(null);
                  if (!id) return;
                  const marker = result.markers.find(
                    (marker) => marker.id === id,
                  );
                  if (marker && marker.page !== result.page)
                    navigate({ page: String(marker.page) }, false);
                  if (window.matchMedia("(min-width: 751px)").matches)
                    document.getElementById(`business-${id}`)?.scrollIntoView({
                      block: "nearest",
                      behavior: "smooth",
                    });
                }}
              />
              {activeEntry && (
                <section
                  className="directory-map-card"
                  aria-live="polite"
                  aria-label={activeEntry.name}
                >
                  <button
                    className="directory-map-card-close"
                    type="button"
                    aria-label={s("closeMapPanel")}
                    onClick={() => setSelected(null)}
                  >
                    <X size={17} />
                  </button>
                  <span>{categoryLabel(activeEntry.category, language)}</span>
                  <Link href={`/${activeEntry.subdomain}`}>
                    <h2>{activeEntry.name}</h2>
                    <ArrowUpRight size={20} />
                  </Link>
                  <p>
                    <MapPin size={14} />
                    {activeEntry.address}
                  </p>
                  {activeEntry.approximate && <small>{s("approximate")}</small>}
                  <div>
                    <Link href={`/${activeEntry.subdomain}`}>
                      {s("discover")}
                      <ArrowRight size={16} />
                    </Link>
                    {activeEntry.phone && (
                      <a
                        href={`tel:${activeEntry.phone}`}
                        onClick={() => trackEvent("call", activeEntry.id)}
                      >
                        <Phone size={15} />
                        {s("call")}
                      </a>
                    )}
                  </div>
                </section>
              )}
              <button
                className="directory-map-show-list"
                type="button"
                onClick={() => navigate({ view: "list" }, false)}
              >
                <List size={17} />
                {s("showList")}
                <span>{result.total}</span>
              </button>
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
