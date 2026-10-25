import { allCommunes, allWilayas, publicLocation } from "@/lib/locations";
import { normalizeSearchText } from "@/lib/search-normalization";
import { locationSchema } from "./document";

const spellingAliases: Record<string, string[]> = {
  "Bab Azzouar": ["Bab Ezzouar"],
  Bachedjerah: ["Bachdjerrah", "Bachedjarah"],
};
const names = (place: { fr: string; ar: string }) =>
  [place.fr, place.ar, ...(spellingAliases[place.fr] || [])].map(
    normalizeSearchText,
  );
const communes = allCommunes.map((commune) => ({
  ...commune,
  names: names(commune),
}));
const wilayas = allWilayas.map((wilaya) => ({
  ...wilaya,
  names: names(wilaya),
}));

// Display-only compatibility for historical public addresses. Match complete
// locality tokens, never substrings, and never persist inferred administrative codes.
export function publicMapPoint(location: unknown, address: string) {
  const parsed = locationSchema.safeParse(location);
  if (parsed.success) {
    const safe = publicLocation(parsed.data);
    return safe.point ? { ...safe.point, mode: safe.mode } : null;
  }
  if (location != null) return null;
  const tokens = address
    .split(/[,،;|\n]/)
    .map(normalizeSearchText)
    .filter(Boolean);
  const regionToken = [...tokens]
    .reverse()
    .find((token) => wilayas.some((w) => w.names.includes(token)));
  const regions = wilayas.filter(
    (w) => regionToken && w.names.includes(regionToken),
  );
  const recognized = communes.filter((c) =>
    c.names.some((name) => tokens.includes(name)),
  );
  const candidates = recognized.filter(
    (c) => !regions.length || regions.some((w) => w.code === c.wilayaCode),
  );
  if (
    regions.length &&
    recognized.some((c) => !regions.some((w) => w.code === c.wilayaCode)) &&
    candidates.every((c) =>
      regions.some((w) => w.names.some((name) => c.names.includes(name))),
    )
  )
    return null;
  // A detailed locality wins over the regional capital in "El Biar, Alger".
  const local = candidates.filter(
    (c) => !regions.some((w) => w.names.some((name) => c.names.includes(name))),
  );
  const matches = local.length ? local : candidates;
  if (matches.length !== 1) return null;
  return {
    lat: matches[0].lat,
    lng: matches[0].lng,
    source: "commune" as const,
    mode: "establishment",
  };
}
