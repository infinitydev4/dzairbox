import communes from "@/data/locations/communes.json";
import wilayas from "@/data/locations/wilayas.json";
import { type BusinessLocation } from "@/lib/studio/document";
export const locationVersion = "DZ-2026-69-v1";
export const allWilayas = wilayas.map((w) => ({
  code: String(w.code).padStart(2, "0"),
  fr: w.name,
  ar: w.name_ar,
}));
export const allCommunes = communes.map((c) => ({
  code: String(c.id),
  wilayaCode: String(c.wilaya_code).padStart(2, "0"),
  fr: c.name,
  ar: c.name_ar,
  lat: c.latitude,
  lng: c.longitude,
}));
export function validateLocation(l: BusinessLocation) {
  // Legacy locations remain editable; structured location is required on publication.
  if (!l.wilayaCode && !l.communeCode) return true;
  return (
    allCommunes.some(
      (c) => c.code === l.communeCode && c.wilayaCode === l.wilayaCode,
    ) && l.areas.every((code) => allCommunes.some((c) => c.code === code))
  );
}
export function locationLabel(
  l: BusinessLocation,
  language: "fr" | "ar" = "fr",
) {
  const commune = allCommunes.find((c) => c.code === l.communeCode);
  const wilaya = allWilayas.find((w) => w.code === l.wilayaCode);
  return [
    l.mode === "establishment" ? l.address : "",
    commune?.[language],
    ...(l.mode === "area"
      ? l.areas
          .filter((code) => code !== l.communeCode)
          .map((code) => allCommunes.find((c) => c.code === code)?.[language])
      : []),
    wilaya?.[language],
  ]
    .filter(Boolean)
    .join(", ");
}
export function publicLocation(l: BusinessLocation): BusinessLocation {
  const next = structuredClone(l);
  if (
    next.point?.source === "google" &&
    (!next.point.expiresAt ||
      new Date(next.point.expiresAt).getTime() <= Date.now())
  )
    next.point = null;
  if (next.mode === "area") {
    next.address = "";
    next.placeId = undefined;
    const c = allCommunes.find((c) => c.code === l.communeCode);
    next.point = c ? { lat: c.lat, lng: c.lng, source: "commune" } : null;
  }
  if (!next.point) {
    const c = allCommunes.find((c) => c.code === l.communeCode);
    if (c) next.point = { lat: c.lat, lng: c.lng, source: "commune" };
  }
  return next;
}
