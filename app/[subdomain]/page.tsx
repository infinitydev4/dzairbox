import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { prisma } from "@/lib/prisma";
import { PublicStudioPage } from "@/components/studio/public-page";
import {
  documentFromBusiness,
  localText,
  studioDocumentSchema,
  type StudioDocument,
} from "@/lib/studio/document";
import { publicBusiness } from "@/lib/studio/server";
import { locationLabel } from "@/lib/locations";
import "../studio.css";
const display = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-home-display",
  display: "swap",
});
const getBusiness = cache(async (slug: string) =>
  prisma.business.findFirst({
    where: { subdomain: slug, isActive: true, moderationStatus: "APPROVED" },
    include: {
      pageConfig: {
        select: { config: true, publishedAt: true, configVersion: true },
      },
    },
  }),
);
function publicDocument(
  b: Parameters<typeof documentFromBusiness>[0] & {
    useCustomPage: boolean;
    pageConfig: { publishedAt: Date | null; config: unknown } | null;
  },
): StudioDocument {
  const config =
    b.useCustomPage && b.pageConfig?.publishedAt
      ? b.pageConfig.config
      : undefined;
  const doc = documentFromBusiness(b, config);
  if (!studioDocumentSchema.safeParse(config).success)
    doc.design = { layout: "panorama", palette: "forest", font: "modern" };
  return doc;
}
type Props = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ lang?: string }>;
};
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const b = await getBusiness((await params).subdomain);
  if (!b) return { title: "DzairBox", robots: { index: false } };
  const language =
    (await searchParams).lang === "ar"
      ? "ar"
      : (await searchParams).lang === "fr"
        ? "fr"
        : b.primaryLanguage === "ar"
          ? "ar"
          : "fr";
  const doc = publicDocument(b);
  const title =
    localText(doc.content.title, language, doc.primaryLanguage) || b.name;
  const description =
    localText(doc.content.about, language, doc.primaryLanguage) ||
    `${b.name} · ${locationLabel(doc.profile.location, language) || b.address}`;
  return {
    title,
    description,
    alternates: {
      canonical: `/${b.subdomain}`,
      languages: {
        "fr-DZ": `/${b.subdomain}?lang=fr`,
        "ar-DZ": `/${b.subdomain}?lang=ar`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/${b.subdomain}`,
      locale: language === "ar" ? "ar_DZ" : "fr_DZ",
      type: "website",
      ...(doc.content.cover ? { images: [doc.content.cover] } : {}),
    },
  };
}
export default async function BusinessPage({ params, searchParams }: Props) {
  const b = await getBusiness((await params).subdomain);
  if (!b) notFound();
  const language =
    (await searchParams).lang === "ar"
      ? "ar"
      : (await searchParams).lang === "fr"
        ? "fr"
        : b.primaryLanguage === "ar"
          ? "ar"
          : "fr";
  const publicData = publicBusiness(b);
  const doc = publicDocument(b);
  doc.profile = {
    ...doc.profile,
    name: b.name,
    category: b.category as typeof doc.profile.category,
    phone: b.phone || doc.profile.phone,
    location: publicData.location,
  };
  const label = locationLabel(doc.profile.location, language) || b.address;
  const base = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://dzairbox.com"
  ).replace(/\/$/, "");
  const physical =
    doc.profile.location.mode === "establishment" &&
    !!doc.profile.location.address;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": physical ? "LocalBusiness" : "Organization",
    name: b.name,
    url: `${base}/${b.subdomain}`,
    telephone: b.phone,
    description:
      localText(doc.content.about, language, doc.primaryLanguage) || undefined,
    ...(physical
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: doc.profile.location.address,
            addressCountry: "DZ",
            addressLocality: label,
          },
        }
      : { areaServed: label }),
    ...(doc.content.cover
      ? { image: new URL(doc.content.cover, base).href }
      : {}),
    sameAs: Object.values(doc.content.socials).filter(Boolean),
  };
  return (
    <div className={display.variable}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonld).replace(/</g, "\\u003c"),
        }}
      />
      <PublicStudioPage
        document={doc}
        businessId={b.id}
        ownerId={b.userId || undefined}
        language={language}
        locationLabel={label}
      />
    </div>
  );
}
