import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { directorySearchClauses } from "@/lib/search-normalization";
import { publicBusiness } from "@/lib/studio/server";
import { refreshExpiredCoordinates } from "@/lib/studio/geocoding";
import { publicMapPoint } from "./map-location";
import { locationLabel } from "@/lib/locations";
import { locationSchema } from "./document";
import type { MapEntry } from "@/lib/directory-map";
export async function searchDirectory(params: URLSearchParams) {
  if (params.get("view") === "map") await refreshExpiredCoordinates();
  const page = Math.max(
    1,
    Math.min(100000, Math.floor(Number(params.get("page"))) || 1),
  );
  const pageSize = 12;
  const query = (params.get("q") || params.get("search") || "").slice(0, 160);
  const where: Prisma.BusinessWhereInput = {
    isActive: true,
    moderationStatus: "APPROVED",
  };
  if (params.get("category"))
    where.category = { equals: params.get("category")!, mode: "insensitive" };
  if (params.get("wilaya")) where.wilayaCode = params.get("wilaya")!;
  if (params.get("commune"))
    where.OR = [
      { communeCode: params.get("commune")! },
      {
        location: { path: ["areas"], array_contains: [params.get("commune")!] },
      },
    ];
  const lat = Number(params.get("lat")),
    lng = Number(params.get("lng"));
  if (
    params.has("lat") &&
    params.has("lng") &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    const delta = 0.35;
    where.AND = [
      { location: { path: ["point", "lat"], gte: lat - delta } },
      { location: { path: ["point", "lat"], lte: lat + delta } },
      { location: { path: ["point", "lng"], gte: lng - delta } },
      { location: { path: ["point", "lng"], lte: lng + delta } },
    ];
  }
  const clauses = directorySearchClauses(query);
  if (clauses.length)
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      ...clauses.map((alternatives) => ({
        OR: alternatives.flatMap((term) => [
          { searchText: { contains: term, mode: "insensitive" as const } },
          { name: { contains: term, mode: "insensitive" as const } },
          { category: { contains: term, mode: "insensitive" as const } },
          { address: { contains: term, mode: "insensitive" as const } },
        ]),
      })),
    ];
  const [total, items, mapRows] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        subdomain: true,
        location: true,
        address: true,
        category: true,
        phone: true,
      },
      take: 1000,
      orderBy: [{ name: "asc" }, { id: "asc" }],
    }),
  ]);
  const markers: MapEntry[] = mapRows.flatMap((row, index) => {
    const parsed = locationSchema.safeParse(row.location);
    const point = publicMapPoint(row.location, row.address);
    return point
      ? [
          {
            id: row.id,
            name: row.name,
            subdomain: row.subdomain,
            lat: point.lat,
            lng: point.lng,
            approximate: point.source === "commune",
            mode: point.mode,
            page: Math.floor(index / pageSize) + 1,
            category: row.category,
            address:
              parsed.success && parsed.data.mode === "area"
                ? locationLabel(parsed.data)
                : row.address,
            phone: row.phone,
          },
        ]
      : [];
  });
  return {
    items: items.map(publicBusiness),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    markers,
    mapLimited: mapRows.length === 1000,
  };
}
