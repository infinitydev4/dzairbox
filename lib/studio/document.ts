import { z } from "zod";
import { daysOfWeek } from "@/lib/constants";
import { normalizeSearchText } from "@/lib/search-normalization";

export const sectionTypes = [
  "intro",
  "about",
  "services",
  "gallery",
  "hours",
  "location",
  "contact",
  "faq",
] as const;
export const palettes = {
  forest: ["#103832", "#17745f", "#f6c96b"],
  ocean: ["#214e67", "#337c91", "#b9dce3"],
  clay: ["#824b38", "#a96348", "#f6c96b"],
} as const;
const text = (max = 2000) => z.string().max(max);
const mediaUrl = z.union([
  z.literal(""),
  z.string().regex(/^\/api\/media\/[a-z0-9-]+$/i),
  z.url().refine((v) => /^https?:\/\//i.test(v)),
]);
export const localized = z.object({ fr: text(), ar: text() });
export const locationSchema = z.object({
  mode: z.enum(["establishment", "area"]),
  wilayaCode: text(2),
  communeCode: text(12),
  address: text(300),
  areas: z.array(text(12)).max(100),
  point: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      source: z.enum(["user", "google", "commune"]),
      expiresAt: z.string().datetime().optional(),
    })
    .nullable(),
  placeId: text(300).optional(),
  geocodeExpiresAt: z.string().datetime().optional(),
});
export const profileSchema = z.object({
  name: z.string().trim().max(100),
  category: z.string().trim().min(1).max(100),
  phone: z.string().max(32),
  location: locationSchema,
});
const time = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/);
export const studioDocumentSchema = z
  .object({
    version: z.literal(2),
    profile: profileSchema,
    primaryLanguage: z.enum(["fr", "ar"]),
    design: z.object({
      layout: z.enum(["panorama", "essential", "signature"]),
      palette: z.enum(["forest", "ocean", "clay"]),
      font: z.enum(["modern", "humanist", "editorial"]),
      colors: z
        .tuple([
          z.string().regex(/^#[0-9a-f]{6}$/i),
          z.string().regex(/^#[0-9a-f]{6}$/i),
          z.string().regex(/^#[0-9a-f]{6}$/i),
        ])
        .optional(),
    }),
    content: z.object({
      title: localized,
      about: localized,
      logo: mediaUrl,
      cover: mediaUrl,
      services: z
        .array(
          z.object({
            id: text(80),
            title: localized,
            description: localized,
            image: mediaUrl,
            priceMode: z.enum(["quote", "fixed", "from"]),
            price: z.number().nonnegative().max(1e10).nullable(),
          }),
        )
        .max(100),
      gallery: z
        .array(z.object({ id: text(80), url: mediaUrl, alt: localized }))
        .max(100),
      faq: z
        .array(
          z.object({ id: text(80), question: localized, answer: localized }),
        )
        .max(50),
      appointmentOnly: z.boolean(),
      hours: z.record(
        z.enum(daysOfWeek.map((d) => d.key)),
        z.object({ open: time, close: time, closed: z.boolean() }),
      ),
      email: z.string().max(254),
      whatsapp: z.string().max(32),
      socials: z.object({
        facebook: text(500),
        instagram: text(500),
        tiktok: text(500),
        youtube: text(500),
      }),
    }),
    sections: z
      .array(z.object({ type: z.enum(sectionTypes), enabled: z.boolean() }))
      .length(sectionTypes.length),
  })
  .superRefine((doc, ctx) => {
    if (new Set(doc.sections.map((s) => s.type)).size !== sectionTypes.length)
      ctx.addIssue({ code: "custom", path: ["sections"], message: "sections" });
    if (
      doc.profile.location.mode === "area" &&
      (doc.profile.location.address ||
        (doc.profile.location.point?.source !== "commune" &&
          doc.profile.location.point !== null))
    )
      ctx.addIssue({
        code: "custom",
        path: ["profile", "location"],
        message: "private_address",
      });
  });
export type StudioDocument = z.infer<typeof studioDocumentSchema>;
export type BusinessLocation = z.infer<typeof locationSchema>;
export type StudioProfile = StudioDocument["profile"];
export type SectionType = (typeof sectionTypes)[number];
export const blankText = (fr = "", ar = "") => ({ fr, ar });
export function localText(
  value: { fr: string; ar: string },
  language: "fr" | "ar",
  primary: "fr" | "ar",
) {
  return value[language] || value[primary] || value.fr || value.ar;
}
export function normalizePhone(value: string) {
  let n = value.replace(/\D/g, "");
  if (n.startsWith("00213")) n = n.slice(2);
  if (n.startsWith("0")) n = `213${n.slice(1)}`;
  if (n.length === 9) n = `213${n}`;
  return `+${n}`;
}
export function sameProfile(a: StudioProfile, b: StudioProfile) {
  const identity = (p: StudioProfile) => ({
    ...p,
    location: {
      mode: p.location.mode,
      wilayaCode: p.location.wilayaCode,
      communeCode: p.location.communeCode,
      address: p.location.address,
      areas: [...p.location.areas].sort(),
      point:
        p.location.point && p.location.point.source !== "commune"
          ? { lat: p.location.point.lat, lng: p.location.point.lng }
          : null,
    },
  });
  return JSON.stringify(identity(a)) === JSON.stringify(identity(b));
}
export function searchable(doc: StudioDocument) {
  return normalizeSearchText(
    [
      doc.profile.name,
      doc.profile.category,
      doc.profile.location.address,
      doc.content.about.fr,
      doc.content.about.ar,
      ...doc.content.services.flatMap((s) => [s.title.fr, s.title.ar]),
    ].join(" "),
  );
}
export function publicationErrors(doc: StudioDocument) {
  const errors: string[] = [];
  if (
    doc.profile.name.trim().length < 2 ||
    !/^\+213[1-9]\d{8}$/.test(doc.profile.phone)
  )
    errors.push("intro");
  if (
    (doc.content.email && !z.email().safeParse(doc.content.email).success) ||
    (doc.content.whatsapp && !/^\+213[1-9]\d{8}$/.test(doc.content.whatsapp)) ||
    Object.values(doc.content.socials).some(
      (url) => url && !/^https?:\/\//i.test(url),
    )
  )
    errors.push("contact");
  if (!doc.profile.location.wilayaCode || !doc.profile.location.communeCode)
    errors.push("location");
  if (
    doc.profile.location.mode === "establishment" &&
    doc.profile.location.address.trim().length < 5
  )
    errors.push("address");
  if (!doc.content.about[doc.primaryLanguage].trim()) errors.push("about");
  if (doc.content.services.some((s) => !s.title[doc.primaryLanguage].trim()))
    errors.push("services");
  if (
    doc.content.faq.some(
      (s) =>
        !s.question[doc.primaryLanguage].trim() ||
        !s.answer[doc.primaryLanguage].trim(),
    )
  )
    errors.push("faq");
  if (
    !doc.content.appointmentOnly &&
    (Object.values(doc.content.hours).every((h) => h.closed) ||
      Object.values(doc.content.hours).some(
        (h) => !h.closed && (!h.open || !h.close || h.open >= h.close),
      ))
  )
    errors.push("hours");
  if (
    doc.content.services.some(
      (s) => s.priceMode !== "quote" && s.price === null,
    )
  )
    errors.push("services");
  return errors;
}
export function emptyDocument(
  profile: StudioProfile,
  primaryLanguage: "fr" | "ar" = "fr",
): StudioDocument {
  return {
    version: 2,
    profile,
    primaryLanguage,
    design: { layout: "panorama", palette: "forest", font: "modern" },
    content: {
      title: blankText(),
      about: blankText(),
      logo: "",
      cover: "",
      services: [],
      gallery: [],
      faq: [],
      appointmentOnly: true,
      hours: Object.fromEntries(
        daysOfWeek.map((d) => [
          d.key,
          { open: "09:00", close: "18:00", closed: d.key === "friday" },
        ]),
      ) as StudioDocument["content"]["hours"],
      email: "",
      whatsapp: "",
      socials: { facebook: "", instagram: "", tiktok: "", youtube: "" },
    },
    sections: sectionTypes.map((type) => ({
      type,
      enabled: type !== "gallery" && type !== "faq",
    })),
  };
}
export type LegacyBusiness = {
  name: string;
  category: string;
  phone: string | null;
  address: string;
  description?: string | null;
  services?: string | null;
  images?: unknown;
  heroImage?: string | null;
  hours?: unknown;
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  location?: unknown;
  primaryLanguage?: string;
};
export function profileFromBusiness(b: LegacyBusiness): StudioProfile {
  const location = locationSchema.safeParse(b.location);
  return {
    name: b.name,
    category: b.category as StudioProfile["category"],
    phone: normalizePhone(b.phone || ""),
    location: location.success
      ? location.data
      : {
          mode: "establishment",
          address: b.address,
          wilayaCode: "",
          communeCode: "",
          areas: [],
          point: null,
        },
  };
}
function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
export function documentFromBusiness(
  b: LegacyBusiness,
  old?: unknown,
): StudioDocument {
  const modern = studioDocumentSchema.safeParse(old);
  if (modern.success) return modern.data;
  const doc = emptyDocument(
    profileFromBusiness(b),
    b.primaryLanguage === "ar" ? "ar" : "fr",
  );
  const lang = doc.primaryLanguage;
  doc.content.about[lang] = b.description || "";
  doc.content.services = (b.services || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title, i) => ({
      id: `legacy-${i}`,
      title: blankText(lang === "fr" ? title : "", lang === "ar" ? title : ""),
      description: blankText(),
      image: "",
      priceMode: "quote",
      price: null,
    }));
  const images = parseJson(b.images);
  if (Array.isArray(images))
    doc.content.gallery = images
      .filter((v): v is string => typeof v === "string")
      .map((url, i) => ({ id: `legacy-image-${i}`, url, alt: blankText() }));
  doc.content.cover = b.heroImage || "";
  doc.content.email = b.email || "";
  for (const key of ["facebook", "instagram", "tiktok", "youtube"] as const)
    doc.content.socials[key] = b[key] || "";
  const hours = parseJson(b.hours);
  if (hours && typeof hours === "object")
    for (const day of daysOfWeek) {
      const h = (hours as Record<string, unknown>)[day.key];
      if (h && typeof h === "object" && "open" in h && "close" in h) {
        doc.content.hours[day.key] =
          h as StudioDocument["content"]["hours"]["sunday"];
        doc.content.appointmentOnly = false;
      }
    }
  if (old && typeof old === "object") {
    const config = old as {
      theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
      };
      templateKey?: string;
      hero?: { title?: string; description?: string; backgroundImage?: string };
      sections?: {
        about?: { content?: string };
        gallery?: { images?: string[] };
        [key: string]: unknown;
      };
    };
    if (
      config.theme?.primaryColor &&
      config.theme?.secondaryColor &&
      /^#[0-9a-f]{6}$/i.test(config.theme.primaryColor) &&
      /^#[0-9a-f]{6}$/i.test(config.theme.secondaryColor)
    )
      doc.design.colors = [
        config.theme.primaryColor,
        config.theme.secondaryColor,
        config.theme.accentColor || "#f6c96b",
      ];
    doc.design.layout =
      config.templateKey === "sidebar-left"
        ? "signature"
        : config.templateKey === "sidebar-right"
          ? "essential"
          : "panorama";
    if (config.hero?.title) doc.content.title[lang] = config.hero.title;
    if (config.sections?.about?.content || config.hero?.description)
      doc.content.about[lang] =
        config.sections?.about?.content || config.hero?.description || "";
    if (config.hero?.backgroundImage)
      doc.content.cover = config.hero.backgroundImage;
    if (config.sections?.gallery?.images)
      doc.content.gallery = config.sections.gallery.images.map((url, i) => ({
        id: `legacy-image-${i}`,
        url,
        alt: blankText(),
      }));
    for (const s of doc.sections) {
      const oldSection = config.sections?.[s.type] as
        | { enabled?: boolean }
        | undefined;
      if (oldSection?.enabled !== undefined) s.enabled = oldSection.enabled;
    }
  }
  return doc;
}
// Registry shared with future producers. V1 renders only these validated native modules.
export const moduleRegistry = Object.fromEntries(
  sectionTypes.map((type) => [
    type,
    { type, version: 1, source: "native" as const },
  ]),
);
