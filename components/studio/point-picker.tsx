"use client";
import { useEffect, useRef, useState } from "react";
import { loadMaps } from "@/lib/google-maps";
import { useLanguage } from "@/components/language-provider";
import type { BusinessLocation } from "@/lib/studio/document";
export function PointPicker({
  location,
  onChange,
}: {
  location: BusinessLocation;
  onChange: (l: BusinessLocation) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const canvas = useRef<HTMLDivElement>(null);
  const latest = useRef({ location, onChange });
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  useEffect(() => {
    latest.current = { location, onChange };
  }, [location, onChange]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const failedToLoad = () => setFailed(true);
    window.addEventListener("dzairbox-map-error", failedToLoad);
    void loadMaps()
      .then(() => {
        if (!active || !canvas.current) return;
        const initial = latest.current.location.point;
        const point =
          initial?.source === "commune" ||
          (initial?.source === "google" &&
            (!initial.expiresAt || Date.parse(initial.expiresAt) <= Date.now()))
            ? null
            : initial;
        map.current = new google.maps.Map(canvas.current, {
          center: initial || { lat: 36.75, lng: 3.06 },
          zoom: point ? 16 : 10,
          mapTypeControl: false,
          streetViewControl: false,
        });
        marker.current = new google.maps.Marker({
          map: map.current,
          position: point || undefined,
          draggable: true,
        });
        function choose(point: google.maps.LatLng) {
          const current = latest.current;
          current.onChange({
            ...current.location,
            placeId: undefined,
            geocodeExpiresAt: undefined,
            point: { lat: point.lat(), lng: point.lng(), source: "user" },
          });
        }
        map.current.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            marker.current?.setPosition(event.latLng);
            choose(event.latLng);
          }
        });
        marker.current.addListener(
          "dragend",
          (event: google.maps.MapMouseEvent) => {
            if (event.latLng) choose(event.latLng);
          },
        );
        const geocodedAddress = latest.current.location.address;
        if (!point && geocodedAddress)
          new google.maps.Geocoder().geocode(
            {
              address: geocodedAddress + ", Algérie",
              componentRestrictions: { country: "DZ" },
            },
            (results, status) => {
              if (!active || status !== "OK" || !results?.[0]) return;
              const current = latest.current;
              if (
                current.location.mode !== "establishment" ||
                current.location.address !== geocodedAddress ||
                current.location.point?.source === "user"
              )
                return;
              const place = results[0],
                p = place.geometry.location;
              map.current?.setCenter(p);
              map.current?.setZoom(16);
              marker.current?.setPosition(p);
              current.onChange({
                ...current.location,
                placeId: place.place_id,
                point: {
                  lat: p.lat(),
                  lng: p.lng(),
                  source: "google",
                  expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(),
                },
              });
            },
          );
      })
      .catch(() => setFailed(true));
    return () => {
      active = false;
      window.removeEventListener("dzairbox-map-error", failedToLoad);
      if (map.current && window.google)
        google.maps.event.clearInstanceListeners(map.current);
      if (marker.current && window.google)
        google.maps.event.clearInstanceListeners(marker.current);
    };
  }, [open, attempt, location.mode]);
  if (location.mode !== "establishment") return null;
  return (
    <div className="st-pin">
      <button
        type="button"
        className="st-secondary"
        onClick={() => setOpen((v) => !v)}
      >
        {t("studio.pin")}
      </button>
      {open && (
        <>
          <p className="st-help">{t("studio.pinHelp")}</p>
          {failed ? (
            <div role="status">
              <p>{t("studio.mapError")}</p>
              <button
                type="button"
                className="st-link"
                onClick={() => {
                  setFailed(false);
                  setAttempt((value) => value + 1);
                }}
              >
                {t("studio.retry")}
              </button>
            </div>
          ) : (
            <div
              ref={canvas}
              style={{ height: 240, borderRadius: 12, marginTop: 12 }}
            />
          )}
        </>
      )}
    </div>
  );
}
