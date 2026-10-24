"use client";
import { locationLabel as resolveLocationLabel } from "@/lib/locations";
import { categoryLabel } from "@/lib/category-label";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  MessageCircle,
  Clock3,
  Pencil,
  Store,
} from "lucide-react";
import { daysOfWeek } from "@/lib/constants";
import {
  palettes,
  localText,
  type StudioDocument,
  type SectionType,
} from "@/lib/studio/document";
import { studioText } from "@/lib/studio/copy";
import { useLanguage } from "@/components/language-provider";
import { trackEvent } from "@/lib/studio/events";

export function StudioCanvas({
  document: doc,
  businessId,
  language: requestedLanguage,
  locationLabel,
  onSelect,
  selected,
}: {
  document: StudioDocument;
  businessId: string;
  language?: "fr" | "ar";
  locationLabel?: string;
  onSelect?: (section: SectionType) => void;
  selected?: string;
}) {
  const { language: uiLanguage } = useLanguage();
  const language = requestedLanguage || uiLanguage;
  const s = (key: string) => studioText(language, key);
  const txt = (value: { fr: string; ar: string }) =>
    localText(value, language, doc.primaryLanguage);
  const displayedLocation =
    locationLabel || resolveLocationLabel(doc.profile.location, language);
  const [primary, secondary, accent] =
    doc.design.colors || palettes[doc.design.palette];
  const preview = !!onSelect;
  const links = [
    {
      kind: "call",
      href: `tel:${doc.profile.phone}`,
      label: s("call"),
      Icon: Phone,
    },
    ...(doc.content.whatsapp
      ? [
          {
            kind: "whatsapp",
            href: `https://wa.me/${doc.content.whatsapp.replace(/\D/g, "")}`,
            label: "WhatsApp",
            Icon: MessageCircle,
          },
        ]
      : []),
    ...(doc.content.email
      ? [
          {
            kind: "email",
            href: `mailto:${doc.content.email}`,
            label: s("email"),
            Icon: Mail,
          },
        ]
      : []),
  ];
  const contact = (hero = false) => (
    <div className={`bc-actions ${hero ? "bc-actions-hero" : ""}`}>
      {links.map((link) => (
        <a
          key={link.kind}
          href={preview ? undefined : link.href}
          onClick={() => !preview && trackEvent(link.kind, businessId)}
        >
          <link.Icon size={17} />
          {link.label}
          <ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );
  const directional =
    doc.profile.location.mode === "establishment" &&
    doc.profile.location.address;
  const original =
    language !== doc.primaryLanguage &&
    !doc.content.about[language] &&
    !!doc.content.about[doc.primaryLanguage];
  function sectionContent(type: SectionType) {
    switch (type) {
      case "intro":
        return (
          <>
            <div className="bc-hero-art">
              {doc.content.cover ? (
                <Image
                  src={doc.content.cover}
                  alt={doc.profile.name}
                  fill
                  unoptimized
                  sizes="100vw"
                />
              ) : (
                <div className="bc-hero-pattern">
                  <Store size={130} strokeWidth={0.6} />
                </div>
              )}
            </div>
            <div className="bc-hero-copy">
              {doc.content.logo && (
                <Image
                  className="bc-logo"
                  width={72}
                  height={72}
                  unoptimized
                  src={doc.content.logo}
                  alt={doc.profile.name}
                />
              )}
              <span className="bc-category">
                {categoryLabel(doc.profile.category, language)}
              </span>
              <h1>{txt(doc.content.title) || doc.profile.name}</h1>
              <p className="bc-hero-location">
                <MapPin size={15} />
                {displayedLocation ||
                  doc.profile.location.address ||
                  s("areaBadge")}
              </p>
              {contact(true)}
            </div>
          </>
        );
      case "about":
        return (
          <>
            <span className="bc-section-number">01</span>
            <h2>{s("about")}</h2>
            {original && <p className="bc-original">{s("originalContent")}</p>}
            <p className="bc-about">
              {txt(doc.content.about) || (preview ? s("aboutPlaceholder") : "")}
            </p>
          </>
        );
      case "services":
        return (
          <>
            <span className="bc-section-number">02</span>
            <h2>{s("services")}</h2>
            <div className="bc-service-grid">
              {doc.content.services.map((service) => (
                <article key={service.id}>
                  {service.image && (
                    <div className="bc-service-image">
                      <Image
                        src={service.image}
                        alt={txt(service.title)}
                        fill
                        sizes="400px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <h3>{txt(service.title)}</h3>
                    <p>{txt(service.description)}</p>
                    <span className="bc-price">
                      {service.priceMode === "quote"
                        ? s("quote")
                        : `${service.priceMode === "from" ? s("from") + " " : ""}${service.price?.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")} DZD`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            {preview && !doc.content.services.length && (
              <p>{s("emptyServices")}</p>
            )}
          </>
        );
      case "gallery":
        return (
          <>
            <span className="bc-section-number">03</span>
            <h2>{s("gallery")}</h2>
            <div className="bc-gallery">
              {doc.content.gallery
                .filter((img) => img.url)
                .map((img) => (
                  <figure key={img.id}>
                    <Image
                      src={img.url}
                      alt={txt(img.alt)}
                      fill
                      unoptimized
                      sizes="400px"
                    />
                    {txt(img.alt) && <figcaption>{txt(img.alt)}</figcaption>}
                  </figure>
                ))}
            </div>
          </>
        );
      case "hours":
        return (
          <>
            <h2>
              <Clock3 size={22} />
              {s("hours")}
            </h2>
            {doc.content.appointmentOnly ? (
              <p>{s("appointment")}</p>
            ) : (
              <dl className="bc-hours">
                {daysOfWeek.map((day) => (
                  <div key={day.key}>
                    <dt>{language === "ar" ? day.labelAr : day.labelFr}</dt>
                    <dd dir="ltr">
                      {doc.content.hours[day.key].closed
                        ? s("closed")
                        : `${doc.content.hours[day.key].open} – ${doc.content.hours[day.key].close}`}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        );
      case "location":
        return (
          <>
            <h2>
              <MapPin size={22} />
              {s("location")}
            </h2>
            {doc.profile.location.mode === "area" && (
              <span className="bc-zone">{s("areaBadge")}</span>
            )}
            <p>{displayedLocation || doc.profile.location.address}</p>
            {directional && (
              <a
                className="bc-direction"
                href={
                  preview
                    ? undefined
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.profile.location.address)}`
                }
                target="_blank"
                rel="noreferrer"
                onClick={() => !preview && trackEvent("directions", businessId)}
              >
                {s("directions")}
                <ArrowUpRight size={15} />
              </a>
            )}
          </>
        );
      case "contact":
        return (
          <>
            <h2>{s("contactUs")}</h2>
            {contact()}
            <div className="bc-socials">
              {Object.entries(doc.content.socials)
                .filter(([, url]) => /^https?:\/\//i.test(url))
                .map(([social, url]) => (
                  <a
                    key={social}
                    href={preview ? undefined : url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => !preview && trackEvent("social", businessId)}
                  >
                    {social}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
            </div>
          </>
        );
      case "faq":
        return (
          <>
            <h2>{s("faq")}</h2>
            <div className="bc-faq">
              {doc.content.faq.map((item) => (
                <details key={item.id}>
                  <summary>{txt(item.question)}</summary>
                  <p>{txt(item.answer)}</p>
                </details>
              ))}
            </div>
          </>
        );
    }
  }
  return (
    <div
      className={`business-canvas bc-${doc.design.layout} bc-font-${doc.design.font} ${preview ? "bc-editable" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
      style={
        {
          "--bc-primary": primary,
          "--bc-secondary": secondary,
          "--bc-accent": accent,
        } as React.CSSProperties
      }
    >
      <div className="bc-brandbar">
        <span>{doc.profile.name}</span>
        {!preview && (
          <nav>
            <a href="?lang=fr" lang="fr">
              FR
            </a>
            <a href="?lang=ar" lang="ar">
              ع
            </a>
          </nav>
        )}
      </div>
      {doc.sections
        .filter((section) => section.type === "intro" || section.enabled)
        .filter(
          (section) =>
            preview || section.type !== "gallery" || doc.content.gallery.length,
        )
        .filter(
          (section) =>
            preview ||
            section.type !== "services" ||
            doc.content.services.length,
        )
        .filter(
          (section) =>
            preview || section.type !== "faq" || doc.content.faq.length,
        )
        .map(({ type }) => (
          <section
            className={`bc-section bc-section-${type} ${selected === type ? "bc-selected" : ""}`}
            key={type}
            onClick={preview ? () => onSelect?.(type) : undefined}
          >
            {preview && (
              <button
                className="bc-edit-label"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(type);
                }}
              >
                <Pencil size={12} />
                {s("edit")} · {s(type)}
              </button>
            )}
            {sectionContent(type)}
          </section>
        ))}
      <footer className="bc-footer">
        <span>{s("hosted")}</span>
        <Link
          href="/"
          onClick={(e) => {
            if (preview) e.preventDefault();
          }}
        >
          DzairBox
          <ArrowUpRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
