import { categoryLabel } from "@/lib/category-label";
import { normalizeSearchText } from "@/lib/search-normalization";
import { Prisma, type Business } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  documentFromBusiness,
  profileFromBusiness,
  sameProfile,
  searchable,
  publicationErrors,
  studioDocumentSchema,
  type StudioDocument,
} from "./document";
import {
  locationLabel,
  publicLocation,
  validateLocation,
} from "@/lib/locations";
import { revalidatePath } from "next/cache";

export class StudioError extends Error {
  constructor(
    public code: string,
    public status = 400,
    public details?: unknown,
  ) {
    super(code);
  }
}
const json = (v: unknown) => v as Prisma.InputJsonValue;
export async function ownedBusiness(id: string, userId: string) {
  const business = await prisma.business.findFirst({
    where: { id, userId },
    include: { pageConfig: true, user: { select: { emailVerified: true } } },
  });
  if (!business) throw new StudioError("NOT_FOUND", 404);
  return business;
}
export function canonicalUpdates(doc: StudioDocument) {
  return {
    name: doc.profile.name,
    category: doc.profile.category,
    phone: doc.profile.phone,
    location: json(publicLocation(doc.profile.location)),
    address: locationLabel(doc.profile.location),
    wilayaCode: doc.profile.location.wilayaCode || null,
    communeCode: doc.profile.location.communeCode || null,
    primaryLanguage: doc.primaryLanguage,
    description: doc.content.about[doc.primaryLanguage],
    services: doc.content.services
      .map((s) => s.title[doc.primaryLanguage])
      .filter(Boolean)
      .join(", "),
    hours: doc.content.appointmentOnly
      ? null
      : JSON.stringify(doc.content.hours),
    heroImage: doc.content.cover || null,
    images: JSON.stringify(doc.content.gallery.map((g) => g.url)),
    email: doc.content.email || null,
    ...Object.fromEntries(
      Object.entries(doc.content.socials).map(([k, v]) => [k, v || null]),
    ),
    searchText: normalizeSearchText(
      [
        searchable(doc),
        categoryLabel(doc.profile.category, "fr"),
        categoryLabel(doc.profile.category, "ar"),
        locationLabel(doc.profile.location, "fr"),
        locationLabel(doc.profile.location, "ar"),
      ].join(" "),
    ),
  };
}
export async function readStudio(id: string, userId: string) {
  const b = await ownedBusiness(id, userId);
  const doc = documentFromBusiness(
    b,
    b.pageConfig?.draft || b.pageConfig?.config,
  );
  const media = await prisma.businessMedia.findMany({
    where: { businessId: id, userId },
    select: { id: true },
  });
  const events = await prisma.businessEvent.findMany({
    where: {
      businessId: id,
      day: { gte: new Date(Date.now() - 30 * 86400000) },
    },
    select: { kind: true, count: true },
  });
  const stats: Record<string, number> = {};
  for (const event of events)
    stats[event.kind] = (stats[event.kind] || 0) + event.count;
  return {
    document: doc,
    revision: b.pageConfig?.revision || 0,
    publishedAt: b.pageConfig?.publishedAt || null,
    submittedAt: b.pageConfig?.submittedAt || null,
    business: {
      id: b.id,
      subdomain: b.subdomain,
      status: b.moderationStatus,
      active: b.isActive,
      reason: b.moderationReason,
      profilePending: !!b.profileDraft,
      customPage: b.useCustomPage,
    },
    emailVerified: !!b.user?.emailVerified,
    media: media.map((m) => `/api/media/${m.id}`),
    stats,
  };
}
export async function saveStudio(
  id: string,
  userId: string,
  input: unknown,
  expectedRevision: number,
  publish = false,
) {
  const result = studioDocumentSchema.safeParse(input);
  if (!result.success)
    throw new StudioError("INVALID_DOCUMENT", 400, result.error.flatten());
  const doc = result.data;
  const point = doc.profile.location.point;
  if (point?.source === "google") {
    const maximumExpiry = Date.now() + 29 * 86400000;
    if (!point.expiresAt || Date.parse(point.expiresAt) <= Date.now()) {
      doc.profile.location.point = null;
    } else {
      point.expiresAt = new Date(
        Math.min(Date.parse(point.expiresAt), maximumExpiry),
      ).toISOString();
      doc.profile.location.geocodeExpiresAt = point.expiresAt;
    }
  }
  if (!validateLocation(doc.profile.location))
    throw new StudioError("INVALID_LOCATION");
  // All newly attached uploads must belong to this activity. Legacy URLs are grandfathered only if already referenced.
  const urls = [
    doc.content.logo,
    doc.content.cover,
    ...doc.content.gallery.map((g) => g.url),
    ...doc.content.services.map((s) => s.image),
  ].filter(Boolean);
  const b = await ownedBusiness(id, userId);
  const previousDoc = documentFromBusiness(
    b,
    b.pageConfig?.draft || b.pageConfig?.config,
  );
  const legacy = new Set([
    previousDoc.content.logo,
    previousDoc.content.cover,
    ...previousDoc.content.gallery.map((g) => g.url),
    ...previousDoc.content.services.map((s) => s.image),
  ]);
  for (const url of urls) {
    if (url.startsWith("/api/media/")) {
      if (
        !(await prisma.businessMedia.findFirst({
          where: { id: url.split("/").pop(), businessId: id, userId },
        }))
      )
        throw new StudioError("INVALID_MEDIA", 403);
    } else if (!legacy.has(url)) throw new StudioError("INVALID_MEDIA", 403);
  }
  if (publish && !b.user?.emailVerified)
    throw new StudioError("EMAIL_UNVERIFIED", 403);
  if (publish && b.moderationStatus === "SUSPENDED")
    throw new StudioError("SUSPENDED", 423);
  const invalid = publish ? publicationErrors(doc) : [];
  if (invalid.length) throw new StudioError("INCOMPLETE", 400, invalid);
  const sensitive = !sameProfile(profileFromBusiness(b), doc.profile);
  const pending = publish && (!b.isActive || sensitive);
  const nextRevision = expectedRevision + 1;
  try {
    await prisma.$transaction(async (tx) => {
      // Serialize changes to profile, page and moderation on the same business row.
      await tx.$queryRaw`SELECT id FROM "Business" WHERE id = ${id} FOR UPDATE`;
      const current = await tx.business.findUniqueOrThrow({
        where: { id },
        include: { pageConfig: true },
      });
      if (
        (current.pageConfig?.revision || 0) !== expectedRevision ||
        current.profileRevision !== b.profileRevision ||
        current.isActive !== b.isActive ||
        current.moderationStatus !== b.moderationStatus
      )
        throw new StudioError("REVISION_CONFLICT", 409);
      const data = {
        draft: json(doc),
        revision: nextRevision,
        ...(publish
          ? pending
            ? { submitted: json(doc), submittedAt: new Date() }
            : {
                config: json(doc),
                configVersion: 2,
                publishedAt: new Date(),
                submitted: Prisma.DbNull,
                submittedAt: null,
              }
          : {}),
      };
      await tx.businessPageConfig.upsert({
        where: { businessId: id },
        create: { businessId: id, config: {}, ...data },
        update: data,
      });
      if (publish)
        await tx.business.update({
          where: { id },
          data: pending
            ? {
                profileDraft: json(doc.profile),
                moderationReason: null,
                ...(!b.isActive ? { moderationStatus: "PENDING" } : {}),
              }
            : {
                ...canonicalUpdates(doc),
                useCustomPage: true,
                profileDraft: Prisma.DbNull,
                moderationReason: null,
                profileRevision: { increment: 1 },
              },
        });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new StudioError("REVISION_CONFLICT", 409);
    throw e;
  }
  revalidatePath(`/${b.subdomain}`);
  revalidatePath("/businesses");
  return { revision: nextRevision, pending, published: publish && !pending };
}
export async function moderateBusiness(
  id: string,
  action: "approve" | "reject" | "changes" | "suspend",
  reason: string,
) {
  const b = await prisma.business.findUnique({
    where: { id },
    include: { user: { select: { emailVerified: true } } },
  });
  if (!b) throw new StudioError("NOT_FOUND", 404);
  if (action === "approve" && b.userId && !b.user?.emailVerified)
    throw new StudioError("EMAIL_UNVERIFIED", 409);
  if (action !== "approve" && !reason.trim())
    throw new StudioError("REASON_REQUIRED");
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Business" WHERE id = ${id} FOR UPDATE`;
    const current = await tx.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    const submitted = studioDocumentSchema.safeParse(
      current.pageConfig?.submitted,
    );
    if (action === "approve") {
      const doc = submitted.success ? submitted.data : null;
      if (
        doc &&
        (!validateLocation(doc.profile.location) ||
          publicationErrors(doc).length)
      )
        throw new StudioError("INCOMPLETE");
      await tx.business.update({
        where: { id },
        data: {
          ...(doc ? canonicalUpdates(doc) : {}),
          isActive: true,
          moderationStatus: "APPROVED",
          moderationReason: null,
          profileDraft: Prisma.DbNull,
          profileRevision: { increment: 1 },
          ...(doc ? { useCustomPage: true } : {}),
        },
      });
      if (doc)
        await tx.businessPageConfig.update({
          where: { businessId: id },
          data: {
            config: json(doc),
            configVersion: 2,
            publishedAt: new Date(),
            submitted: Prisma.DbNull,
            submittedAt: null,
          },
        });
    } else {
      await tx.business.update({
        where: { id },
        data: {
          isActive: action === "suspend" ? false : current.isActive,
          moderationStatus:
            action === "suspend"
              ? "SUSPENDED"
              : current.isActive
                ? "APPROVED"
                : action === "reject"
                  ? "REJECTED"
                  : "CHANGES_REQUESTED",
          moderationReason: reason.trim(),
          profileDraft: Prisma.DbNull,
          profileRevision: { increment: 1 },
        },
      });
      if (current.pageConfig)
        await tx.businessPageConfig.update({
          where: { businessId: id },
          data: { submitted: Prisma.DbNull, submittedAt: null },
        });
    }
  });
  revalidatePath(`/${b.subdomain}`);
  revalidatePath("/businesses");
}
export function publicBusiness(b: Business) {
  const loc = profileFromBusiness(b).location;
  return {
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description,
    address: loc.mode === "area" ? locationLabel(loc) : b.address,
    phone: b.phone,
    email: b.email,
    facebook: b.facebook,
    instagram: b.instagram,
    tiktok: b.tiktok,
    youtube: b.youtube,
    services: b.services,
    hours: b.hours,
    heroImage: b.heroImage,
    images: b.images,
    subdomain: b.subdomain,
    location: publicLocation(loc),
    wilayaCode: b.wilayaCode,
    communeCode: b.communeCode,
    primaryLanguage: b.primaryLanguage,
  };
}
