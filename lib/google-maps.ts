import { Loader } from "@googlemaps/js-api-loader";
let pending: Promise<typeof google> | null = null;
export function loadMaps() {
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  )
    return Promise.reject(new Error("MAP_UNAVAILABLE"));
  if (!pending) {
    (window as Window & { gm_authFailure?: () => void }).gm_authFailure =
      () => {
        pending = null;
        window.dispatchEvent(new Event("dzairbox-map-error"));
      };
    pending = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"],
    })
      .load()
      .catch((e) => {
        pending = null;
        throw e;
      });
  }
  return pending;
}
