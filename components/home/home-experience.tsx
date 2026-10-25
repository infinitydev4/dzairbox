"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import {
  ArrowDown,
  ArrowUpRight,
  CarFront,
  Check,
  GraduationCap,
  MapPin,
  Menu,
  Pill,
  Scissors,
  Search,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { HomeMotion } from "./home-motion"
import { BrandLogo } from "@/components/brand-logo"

const categories = [
  { key: "restaurant", term: "restaurant", Icon: UtensilsCrossed, tone: "sun" },
  { key: "pharmacy", term: "pharmacie", Icon: Pill, tone: "blue" },
  { key: "hairdresser", term: "coiffeur", Icon: Scissors, tone: "chalk" },
  { key: "plumber", term: "plombier", Icon: Wrench, tone: "blue" },
  { key: "garage", term: "garage", Icon: CarFront, tone: "chalk" },
  { key: "training", term: "formation", Icon: GraduationCap, tone: "sun" },
] as const

function Brand({ variant = "default", priority = false }: { variant?: "default" | "onDark"; priority?: boolean }) {
  const { t } = useLanguage()
  return (
    <Link className="dz-brand" href="/" aria-label={t("home.nav.homeAria")}>
      <BrandLogo variant={variant} priority={priority} alt="" />
    </Link>
  )
}

function DirectionArrow({ className = "" }: { className?: string }) {
  return <ArrowUpRight className={`dz-direction-arrow ${className}`} size={19} strokeWidth={1.8} aria-hidden="true" />
}

function HomeHeader() {
  const { language, setLanguage, t } = useLanguage()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const createHref = "/onboarding"

  return (
    <header className="dz-header">
      <div className="dz-container dz-header-inner">
        <Brand priority />
        <nav className="dz-header-nav" aria-label={t("home.nav.mainAria")}>
          <a href="#categories">{t("home.nav.explore")}</a>
          <a href="#professionnels">{t("home.nav.howItWorks")}</a>
          <Link href="/businesses">{t("home.footer.directory")}</Link>
        </nav>
        <div className="dz-header-actions">
          <div className="dz-language" aria-label={t("home.nav.language")}>
            <button type="button" onClick={() => setLanguage("fr")} aria-pressed={language === "fr"} lang="fr">FR</button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => setLanguage("ar")} aria-pressed={language === "ar"} lang="ar">ع</button>
          </div>
          {session ? (
            <Link className="dz-header-login" href="/dashboard">{t("home.nav.dashboard")}</Link>
          ) : (
            <Link className="dz-header-login" href="/auth/signin">{t("home.nav.login")}</Link>
          )}
          <Link className="dz-header-cta" href={createHref}>{t("home.nav.create")}<DirectionArrow /></Link>
          <button
            className="dz-menu-button"
            type="button"
            aria-label={menuOpen ? t("home.nav.closeMenu") : t("home.nav.menu")}
            aria-expanded={menuOpen}
            aria-controls="dz-mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="dz-mobile-menu" className="dz-mobile-menu" aria-label={t("home.nav.mobileAria")}>
          <a href="#categories" onClick={() => setMenuOpen(false)}>{t("home.nav.explore")}</a>
          <a href="#professionnels" onClick={() => setMenuOpen(false)}>{t("home.nav.howItWorks")}</a>
          <Link href="/businesses" onClick={() => setMenuOpen(false)}>{t("home.footer.directory")}</Link>
          <Link href={createHref} onClick={() => setMenuOpen(false)}>{t("home.nav.create")}</Link>
          <Link href={session ? "/dashboard" : "/auth/signin"} onClick={() => setMenuOpen(false)}>{session ? t("home.nav.dashboard") : t("home.nav.login")}</Link>
          {session && <button type="button" onClick={() => void signOut()}>{t("home.nav.logout")}</button>}
        </nav>
      )}
    </header>
  )
}

function NeighborhoodArtwork() {
  const { t } = useLanguage()
  return (
    <figure className="dz-neighborhood">
      <div className="dz-neighborhood-image" data-dz-depth>
        <Image src="/images/home/neighborhood-isometric.webp" alt={t("home.media.neighborhoodAlt")} fill sizes="(max-width: 850px) 94vw, 49vw" preload />
      </div>
      <div className="dz-floating-label dz-floating-label-one" data-dz-float><span><MapPin size={17} aria-hidden="true" /></span>{t("home.media.nearby")}</div>
      <div className="dz-floating-label dz-floating-label-two" data-dz-float><span><Wrench size={17} aria-hidden="true" /></span>{t("home.media.knowHow")}</div>
      <figcaption><span className="dz-label-dot" />{t("home.media.heroCaption")}<span className="dz-artwork-note">{t("home.media.illustration")}</span></figcaption>
    </figure>
  )
}

function Hero({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  return (
    <section className="dz-hero" id="recherche" aria-labelledby="home-title">
      <div className="dz-container dz-hero-grid">
        <div className="dz-hero-copy">
          <p className="dz-section-label"><span className="dz-label-dot" />{t("home.hero.label")}</p>
          <h1 id="home-title">{t("home.hero.title")}</h1>
          <p className="dz-hero-description">{t("home.hero.description")}</p>
          <form className="dz-search-form" action="/businesses" method="get" role="search" aria-label={t("home.hero.searchLabel")}>
            <label htmlFor="home-search">{t("home.hero.searchLabel")}</label>
            <div className="dz-search-row">
              <Search size={22} strokeWidth={1.8} aria-hidden="true" />
              <input id="home-search" name="search" type="search" autoComplete="off" placeholder={t("home.hero.searchPlaceholder")} />
              <button type="submit">{t("home.hero.searchButton")}<DirectionArrow /></button>
            </div>
          </form>
          <nav className="dz-search-suggestions" aria-label={t("home.hero.suggestions")}>
            <span>{t("home.hero.suggestions")}</span>
            {categories.slice(0, 3).map(({ key, term }) => (
              <Link key={key} href={`/businesses?search=${encodeURIComponent(term)}`}>{t(`home.categories.${key}`)}</Link>
            ))}
          </nav>
          <p className="dz-search-reassurance"><Check size={14} aria-hidden="true" />{t("home.hero.reassurance")}</p>
          <p className="dz-hero-pro">{t("home.hero.professionalPrompt")} <Link href={createHref}>{t("home.hero.professionalAction")}<DirectionArrow /></Link></p>
        </div>
        <NeighborhoodArtwork />
      </div>
      <a className="dz-scroll-link" href="#categories"><span>{t("home.hero.scroll")}</span><ArrowDown size={17} aria-hidden="true" /></a>
    </section>
  )
}

function ValueStrip() {
  const { t } = useLanguage()
  return (
    <div className="dz-value-strip">
      <div className="dz-container">
        {[{ key: "search", Icon: Search }, { key: "discover", Icon: MapPin }, { key: "contact", Icon: ArrowUpRight }].map(({ key, Icon }, index) => (
          <div className="dz-value-item" key={key}><span className="dz-value-number">0{index + 1}</span><Icon size={21} strokeWidth={1.6} aria-hidden="true" /><p>{t(`home.value.${key}`)}</p></div>
        ))}
      </div>
    </div>
  )
}

function LocalLife() {
  const { t } = useLanguage()
  return (
    <section className="dz-life dz-scene" aria-labelledby="life-title">
      <div className="dz-container">
        <div className="dz-scene-heading">
          <div><p className="dz-section-label"><span className="dz-label-dot" />{t("home.life.label")}</p><div className="dz-reveal-mask"><h2 id="life-title" data-dz-reveal>{t("home.life.title")}</h2></div></div>
          <p>{t("home.life.description")}</p>
        </div>
        <p className="dz-media-note">{t("home.media.generatedScenes")}</p>
        <div className="dz-life-grid">
          <Link href="/businesses?search=restaurant" className="dz-life-card dz-life-cafe" data-dz-photo>
            <div className="dz-life-image"><Image src="/images/home/neighborhood-cafe.webp" alt={t("home.media.cafeAlt")} fill sizes="(max-width: 600px) 92vw, (max-width: 850px) 58vw, 57vw" /></div>
            <span className="dz-life-tag"><UtensilsCrossed size={15} aria-hidden="true" />{t("home.life.cafeTag")}</span>
            <div className="dz-life-caption"><h3>{t("home.life.cafeTitle")}</h3><span>{t("home.life.cafeAction")}<DirectionArrow /></span></div>
          </Link>
          <Link href="/businesses?search=menuisier" className="dz-life-card dz-life-craft" data-dz-photo>
            <div className="dz-life-image"><Image src="/images/home/artisan-workshop.webp" alt={t("home.media.artisanAlt")} fill sizes="(max-width: 600px) 92vw, (max-width: 850px) 38vw, 34vw" /></div>
            <span className="dz-life-tag"><Wrench size={15} aria-hidden="true" />{t("home.life.craftTag")}</span>
            <div className="dz-life-caption"><h3>{t("home.life.craftTitle")}</h3><span>{t("home.life.craftAction")}<DirectionArrow /></span></div>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Categories() {
  const { t } = useLanguage()
  return (
    <section className="dz-categories dz-scene" id="categories" aria-labelledby="categories-title">
      <div className="dz-container">
        <div className="dz-scene-heading">
          <div className="dz-reveal-mask"><h2 id="categories-title" data-dz-reveal>{t("home.categories.title")}</h2></div>
          <p>{t("home.categories.description")}</p>
        </div>
        <div className="dz-category-grid">
          {categories.map(({ key, term, Icon, tone }) => (
            <Link className={`dz-category-card dz-tone-${tone}`} data-dz-category key={key} href={`/businesses?search=${encodeURIComponent(term)}`}>
              <span className="dz-category-icon"><Icon size={31} strokeWidth={1.5} aria-hidden="true" /></span>
              <span className="dz-category-name">{t(`home.categories.${key}`)}</span>
              <DirectionArrow />
            </Link>
          ))}
        </div>
        <Link className="dz-text-link" href="/businesses">{t("home.categories.all")}<DirectionArrow /></Link>
      </div>
    </section>
  )
}

function BusinessPreview() {
  const { t } = useLanguage()
  return (
    <div className="dz-preview-wrap" aria-label={t("home.business.preview")}>
      <div className="dz-preview-note">{t("home.business.preview")}</div>
      <div className="dz-preview-browser">
        <div className="dz-preview-toolbar"><span className="dz-preview-dots"><i /><i /><i /></span><span>dzairbox.com/…</span><span className="dz-preview-toolbar-icon">↗</span></div>
        <div className="dz-preview-cover" aria-hidden="true">
          <Image src="/images/home/artisan-workshop.webp" alt="" fill sizes="(max-width: 600px) 87vw, (max-width: 850px) 570px, 45vw" />
        </div>
        <div className="dz-preview-content">
          <span className="dz-preview-category">{t("home.business.previewCategory")}</span>
          <h3>{t("home.business.previewName")}</h3>
          <p>{t("home.business.previewAbout")}</p>
          <div className="dz-preview-fields">
            <div><span><Check size={16} aria-hidden="true" /></span>{t("home.business.previewServices")}</div>
            <div><span><MapPin size={16} aria-hidden="true" /></span>{t("home.business.previewAddress")}</div>
            <div><span><ArrowUpRight size={16} aria-hidden="true" /></span>{t("home.business.previewContact")}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BusinessScene({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  return (
    <section className="dz-business dz-scene" id="professionnels" aria-labelledby="business-title">
      <div className="dz-container dz-business-grid">
        <div className="dz-business-copy">
          <p className="dz-section-label"><span className="dz-label-dot" />{t("home.business.label")}</p>
          <div className="dz-reveal-mask"><h2 id="business-title" data-dz-reveal>{t("home.business.title")}</h2></div>
          <p className="dz-business-description">{t("home.business.description")}</p>
          <ul className="dz-business-points">
            <li><Check size={19} aria-hidden="true" />{t("home.business.pointOne")}</li>
            <li><Check size={19} aria-hidden="true" />{t("home.business.pointTwo")}</li>
            <li><Check size={19} aria-hidden="true" />{t("home.business.pointThree")}</li>
          </ul>
          <Link className="dz-button dz-button-sun" href={createHref}>{t("home.business.action")}<DirectionArrow /></Link>
          <p className="dz-action-note">{t("home.business.actionNote")}</p>
        </div>
        <BusinessPreview />
      </div>
    </section>
  )
}

function PlaceScene() {
  const { t } = useLanguage()
  return (
    <section className="dz-place dz-scene" id="lieux" aria-labelledby="place-title">
      <div className="dz-container dz-place-grid">
        <figure className="dz-place-artwork">
          <div className="dz-place-artwork-image" data-dz-depth><Image src="/images/home/local-discovery-isometric.webp" alt={t("home.media.discoveryAlt")} fill sizes="(max-width: 850px) 92vw, 48vw" /></div>
          <figcaption>{t("home.media.illustration")}</figcaption>
        </figure>
        <div className="dz-place-copy">
          <p className="dz-section-label"><span className="dz-label-dot" />{t("home.place.label")}</p>
          <div className="dz-reveal-mask"><h2 id="place-title" data-dz-reveal>{t("home.place.title")}</h2></div>
          <p>{t("home.place.description")}</p>
          <form className="dz-place-search" action="/businesses" method="get" role="search" aria-label={t("home.place.searchLabel")}>
            <label htmlFor="place-search">{t("home.place.searchLabel")}</label>
            <div className="dz-place-search-row"><MapPin size={20} aria-hidden="true" /><input id="place-search" name="search" type="search" placeholder={t("home.place.searchPlaceholder")} /><button type="submit" aria-label={t("home.place.searchButton")}><DirectionArrow /></button></div>
          </form>
        </div>
      </div>
    </section>
  )
}

function Benefits({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  return (
    <section className="dz-benefits dz-scene" aria-labelledby="benefits-title">
      <div className="dz-container">
        <p className="dz-section-label"><span className="dz-label-dot" />{t("home.journey.label")}</p>
        <div className="dz-reveal-mask"><h2 id="benefits-title" data-dz-reveal>{t("home.journey.title")}</h2></div>
        <p className="dz-journey-description">{t("home.journey.description")}</p>
        <div className="dz-benefit-grid">
          <article className="dz-benefit dz-benefit-visitor">
            <span className="dz-benefit-symbol"><Search size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <div className="dz-benefit-intro"><h3>{t("home.journey.visitorTitle")}</h3><p>{t("home.benefits.visitorText")}</p></div>
            <ol className="dz-journey-steps">{["One", "Two", "Three"].map((step, index) => <li key={step} data-dz-step><span aria-hidden="true">0{index + 1}</span><div><h4>{t(`home.journey.visitor${step}Title`)}</h4><p>{t(`home.journey.visitor${step}Text`)}</p></div></li>)}</ol>
            <a href="#recherche">{t("home.journey.visitorAction")}<DirectionArrow /></a>
          </article>
          <article className="dz-benefit dz-benefit-pro">
            <span className="dz-benefit-symbol"><MapPin size={26} strokeWidth={1.5} aria-hidden="true" /></span>
            <div className="dz-benefit-intro"><h3>{t("home.journey.professionalTitle")}</h3><p>{t("home.benefits.professionalText")}</p></div>
            <ol className="dz-journey-steps">{["One", "Two", "Three"].map((step, index) => <li key={step} data-dz-step><span aria-hidden="true">0{index + 1}</span><div><h4>{t(`home.journey.professional${step}Title`)}</h4><p>{t(`home.journey.professional${step}Text`)}</p></div></li>)}</ol>
            <Link href={createHref}>{t("home.journey.professionalAction")}<DirectionArrow /></Link>
          </article>
        </div>
      </div>
    </section>
  )
}

function FinalScene({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  return (
    <section className="dz-final dz-scene" aria-labelledby="final-title">
      <div className="dz-container dz-final-inner">
        <div className="dz-final-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="dz-reveal-mask"><h2 id="final-title" data-dz-reveal>{t("home.final.title")}</h2></div>
        <p>{t("home.final.description")}</p>
        <div className="dz-final-actions">
          <Link className="dz-button dz-button-dark" href="/businesses">{t("home.final.explore")}<DirectionArrow /></Link>
          <Link className="dz-button dz-button-light" href={createHref}>{t("home.final.create")}<DirectionArrow /></Link>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const { t } = useLanguage()
  return (
    <section className="dz-faq dz-scene" id="faq" aria-labelledby="faq-title">
      <div className="dz-container dz-faq-grid">
        <h2 id="faq-title">{t("home.faq.title")}</h2>
        <div className="dz-faq-list">
          {[1, 2, 3, 4].map((number) => (
            <details key={number}>
              <summary>{t(`home.faq.q${number}`)}<span aria-hidden="true">+</span></summary>
              <p>{t(`home.faq.a${number}`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomeFooter({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  return (
    <footer className="dz-footer">
      <div className="dz-container dz-footer-main">
        <div><Brand variant="onDark" /><p>{t("home.footer.description")}</p></div>
        <nav aria-label={t("home.nav.footerAria")}>
          <Link href="/businesses">{t("home.footer.directory")}</Link>
          <Link href={createHref}>{t("home.footer.create")}</Link>
          <Link href="/contact">{t("home.footer.contact")}</Link>
        </nav>
      </div>
      <div className="dz-container dz-footer-bottom"><span>© {new Date().getFullYear()} {t("home.footer.copyright")}</span><a href="#recherche" aria-label={t("home.nav.backToSearch")}>↑</a></div>
    </footer>
  )
}

function MobileActions({ createHref }: { createHref: string }) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.querySelector(".dz-hero")
    const final = document.querySelector(".dz-final")
    if (!hero || !final || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(() => {
      setVisible(hero.getBoundingClientRect().bottom <= 0 && final.getBoundingClientRect().top > window.innerHeight)
    })
    observer.observe(hero)
    observer.observe(final)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null
  return <nav className="dz-mobile-actions" aria-label={t("home.nav.quickActions")}><a href="#recherche"><Search size={17} aria-hidden="true" />{t("home.hero.searchButton")}</a><Link href={createHref}>{t("home.nav.create")}<DirectionArrow /></Link></nav>
}

export function HomeExperience() {
  const { language, t } = useLanguage()
  const createHref = "/onboarding"

  return (
    <div className={`dz-home ${language === "ar" ? "dz-home-ar" : ""}`} lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <HomeMotion language={language} />
      <a className="dz-skip" href="#main-content">{t("home.skip")}</a>
      <HomeHeader />
      <main id="main-content">
        <Hero createHref={createHref} />
        <ValueStrip />
        <Categories />
        <LocalLife />
        <BusinessScene createHref={createHref} />
        <PlaceScene />
        <Benefits createHref={createHref} />
        <FinalScene createHref={createHref} />
        <FAQ />
      </main>
      <HomeFooter createHref={createHref} />
      <MobileActions createHref={createHref} />
    </div>
  )
}
