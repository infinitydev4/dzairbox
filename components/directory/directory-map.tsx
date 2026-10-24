"use client";
import { useEffect, useRef, useState } from "react";
import { loadMaps } from "@/lib/google-maps";
import { useLanguage } from "@/components/language-provider";
export type MapEntry = {
  id: string;
  name: string;
  subdomain: string;
  lat: number;
  lng: number;
  approximate: boolean;
  mode: string;
};
export function clusterMarkers(entries: MapEntry[], zoom: number) {
  const size = 360 / Math.pow(2, Math.max(2, zoom) + 2);
  const groups = new Map<string, MapEntry[]>();
  for (const p of entries) {
    const key = `${Math.floor(p.lat / size)}:${Math.floor(p.lng / size)}`;
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  return [...groups.values()];
}
export default function DirectoryMap({
  entries,
  selected,
  onSelect,
  visitor,
}: {
  entries: MapEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
  visitor?: { lat: number; lng: number } | null;
}) {
  const { t } = useLanguage();
  const canvas = useRef<HTMLDivElement>(null);
  const instance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const info = useRef<google.maps.InfoWindow | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(7);
  const callback = useRef(onSelect);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    let active = true;
    const failed = () => setError(true);
    window.addEventListener("dzairbox-map-error", failed);
    void loadMaps()
      .then(() => {
        if (!active || !canvas.current) return;
        instance.current = new google.maps.Map(canvas.current, {
          center: { lat: 34.9, lng: 3.1 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
        });
        info.current = new google.maps.InfoWindow();
        instance.current.addListener("zoom_changed", () =>
          setZoom(instance.current?.getZoom() || 7),
        );
        setReady(true);
      })
      .catch(() => setError(true));
    return () => {
      active = false;
      window.removeEventListener("dzairbox-map-error", failed);
      markers.current.forEach((m) => m.setMap(null));
      if (instance.current && window.google)
        google.maps.event.clearInstanceListeners(instance.current);
    };
  }, [attempt]);
  useEffect(() => {
    if (!ready || !instance.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = clusterMarkers(entries, zoom).map((group) => {
      const pos = {
        lat: group.reduce((n, p) => n + p.lat, 0) / group.length,
        lng: group.reduce((n, p) => n + p.lng, 0) / group.length,
      };
      const marker = new google.maps.Marker({
        map: instance.current,
        position: pos,
        title:
          group.length > 1
            ? `${group.length} ${t("studio.results")}`
            : group[0].name,
        label:
          group.length > 1
            ? { text: String(group.length), color: "white", fontSize: "12px" }
            : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: group.length > 1 ? 20 : 10,
          fillColor: group.some((p) => p.id === selected)
            ? "#caa652"
            : "#17745f",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#fff",
        },
      });
      marker.addListener("click", () => {
        const div = document.createElement("div");
        div.style.cssText =
          "padding:5px;max-width:240px;color:#103832;font:12px Arial;max-height:240px;overflow:auto";
        for (const entry of group.slice(0, 20)) {
          const row = document.createElement("div");
          row.style.cssText = "padding:8px 0;border-bottom:1px solid #dde5d4";
          const button = document.createElement("button");
          button.textContent = entry.name;
          button.style.cssText =
            "display:block;background:none;border:0;text-align:start;font-weight:bold;cursor:pointer";
          button.onclick = () => callback.current(entry.id);
          const a = document.createElement("a");
          a.href = `/${encodeURIComponent(entry.subdomain)}`;
          a.textContent = t("studio.discover") + " ↗";
          a.style.cssText = "display:block;margin-top:7px;color:#17745f";
          row.append(button, a);
          if (entry.approximate) {
            const note = document.createElement("small");
            note.textContent = t("studio.approximate");
            row.append(note);
          }
          div.append(row);
        }
        info.current?.setContent(div);
        info.current?.open(instance.current, marker);
        if (group.length === 1) callback.current(group[0].id);
        else if (zoom < 13) {
          instance.current?.setCenter(pos);
          instance.current?.setZoom(zoom + 2);
        }
      });
      return marker;
    });
    return () => markers.current.forEach((m) => m.setMap(null));
  }, [entries, ready, zoom, selected, t]);
  useEffect(() => {
    if (!ready || !instance.current || !entries.length) return;
    const bounds = new google.maps.LatLngBounds();
    entries.forEach((e) => bounds.extend({ lat: e.lat, lng: e.lng }));
    instance.current.fitBounds(bounds, 40);
  }, [entries, ready]);
  useEffect(() => {
    if (visitor && instance.current) {
      instance.current.setCenter(visitor);
      instance.current.setZoom(11);
    }
  }, [visitor]);
  return (
    <div className="directory-map">
      {error ? (
        <div className="directory-map-error" role="status">
          {t("studio.mapError")}
          <button
            type="button"
            onClick={() => {
              setError(false);
              setReady(false);
              setAttempt((value) => value + 1);
            }}
          >
            {t("studio.retry")}
          </button>
        </div>
      ) : (
        <div ref={canvas} style={{ height: "100%", minHeight: 430 }} />
      )}
    </div>
  );
}
