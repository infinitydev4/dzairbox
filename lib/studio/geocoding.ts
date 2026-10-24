import { prisma } from "@/lib/prisma";
import { locationSchema } from "./document";
import { purgeExpiredGeocodes } from "./geocache";
import type { Prisma } from "@prisma/client";

const retryAfter = new Map<string, number>();
let lastPurge = 0;

export async function refreshExpiredCoordinates() {
  if (Date.now() - lastPurge > 3600000) {
    await purgeExpiredGeocodes(prisma);
    lastPurge = Date.now();
  }
  const key =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return;
  const rows = await prisma.business.findMany({
    where: {
      isActive: true,
      moderationStatus: "APPROVED",
      location: { path: ["geocodeExpiresAt"], lte: new Date().toISOString() },
    },
    select: { id: true, location: true },
    take: 20,
  });
  // Bound concurrent work: provider failures leave the list and commune centres usable.
  const candidates = rows
    .filter((row) => (retryAfter.get(row.id) || 0) <= Date.now())
    .slice(0, 5);
  await Promise.allSettled(
    candidates.map(async (row) => {
      const parsed = locationSchema.safeParse(row.location);
      if (!parsed.success || parsed.data.mode !== "establishment") return;
      const location = parsed.data;
      retryAfter.set(row.id, Date.now() + 3600000);
      try {
        const query = new URLSearchParams({
          key,
          ...(location.placeId
            ? { place_id: location.placeId }
            : {
                address: location.address + ", Algérie",
                components: "country:DZ",
              }),
        });
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?${query}`,
          { signal: AbortSignal.timeout(3000) },
        );
        const result = await response.json();
        const hit = result.results?.[0];
        if (!response.ok || result.status !== "OK" || !hit?.geometry?.location)
          return;
        const expiresAt = new Date(Date.now() + 29 * 86400000).toISOString();
        // Compare-and-swap: an owner moving their marker wins this race.
        await prisma.business.updateMany({
          where: {
            id: row.id,
            location: { equals: row.location as Prisma.InputJsonValue },
          },
          data: {
            location: {
              ...location,
              placeId: hit.place_id,
              geocodeExpiresAt: expiresAt,
              point: {
                lat: hit.geometry.location.lat,
                lng: hit.geometry.location.lng,
                source: "google",
                expiresAt,
              },
            } as Prisma.InputJsonValue,
          },
        });
      } catch {
        // Expired coordinates are never used as a fallback.
      }
    }),
  );
}
