"use client";
import { useEffect, useRef, useState } from "react";
import { Expand, Loader2, MapPin, Minus, Plus, X } from "lucide-react";
import { loadMaps } from "@/lib/google-maps";
import { useLanguage } from "@/components/language-provider";
import { clusterMarkers, type MapEntry } from "@/lib/directory-map";
import { createMapPin, type MapPin as Pin } from "./map-pins";
export { clusterMarkers } from "@/lib/directory-map";
export type { MapEntry } from "@/lib/directory-map";

export default function DirectoryMap({
  entries,
  selected,
  onSelect,
  visitor,
}: {
  entries: MapEntry[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  visitor?: { lat: number; lng: number } | null;
}) {
  const { t, language } = useLanguage();
  const s = (key: string) => t(`studio.${key}`);
  const canvas = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const pins = useRef<Pin[]>([]);
  const callback = useRef(onSelect);
  const fitted = useRef("");
  const [ready, setReady] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(7);
  const [group, setGroup] = useState<MapEntry[]>([]);
  const groupIds = new Set(group.map((entry) => entry.id));
  const visibleGroup = entries.filter((entry) => groupIds.has(entry.id));
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      if (active) setError(true);
    }, 20000);
    const failed = () => {
      clearTimeout(timeout);
      if (active) setError(true);
    };
    window.addEventListener("dzairbox-map-error", failed);
    void loadMaps()
      .then(() => {
        if (!active || !canvas.current) return;
        const instance = new google.maps.Map(canvas.current, {
          center: { lat: 34.9, lng: 3.1 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          rotateControl: false,
          cameraControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          keyboardShortcuts: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
        map.current = instance;
        instance.addListener("tilesloaded", () => {
          clearTimeout(timeout);
          if (active) setTilesLoaded(true);
        });
        fitted.current = "";
        instance.addListener("idle", () => {
          if (active) setZoom(instance.getZoom() || 7);
        });
        instance.addListener("click", () => {
          if (active) setGroup([]);
        });
        setReady(true);
      })
      .catch(failed);
    return () => {
      active = false;
      clearTimeout(timeout);
      window.removeEventListener("dzairbox-map-error", failed);
      pins.current.forEach((pin) => pin.overlay.setMap(null));
      pins.current = [];
      if (map.current && window.google)
        google.maps.event.clearInstanceListeners(map.current);
      map.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    const instance = map.current;
    if (!ready || !instance) return;
    pins.current.forEach((pin) => pin.overlay.setMap(null));
    pins.current = clusterMarkers(entries, zoom).map((entries) =>
      createMapPin(
        instance,
        entries,
        entries.length > 1
          ? `${entries.length} ${t("studio.results")}`
          : entries[0].name,
        () => {
          if (entries.length === 1) {
            setGroup([]);
            callback.current(entries[0].id);
            return;
          }
          const spread = entries.some(
            (e) =>
              Math.abs(e.lat - entries[0].lat) +
                Math.abs(e.lng - entries[0].lng) >
              0.0001,
          );
          if (spread && zoom < 16) {
            const bounds = new google.maps.LatLngBounds();
            entries.forEach((entry) => bounds.extend(entry));
            instance.fitBounds(bounds, 90);
          } else {
            callback.current(null);
            setGroup(entries);
          }
        },
      ),
    );
    return () => {
      pins.current.forEach((pin) => pin.overlay.setMap(null));
      pins.current = [];
    };
  }, [entries, ready, zoom, t]);

  useEffect(() => {
    pins.current.forEach((pin) => {
      const active = pin.entries.some((entry) => entry.id === selected);
      pin.button.classList.toggle("is-selected", active);
      pin.button.setAttribute("aria-pressed", String(active));
      pin.button.style.zIndex = active ? "2" : "1";
    });
  }, [selected, entries, ready, zoom, t]);

  useEffect(() => {
    if (!ready || !map.current || !entries.length) return;
    const key = entries
      .map((entry) => `${entry.id}:${entry.lat}:${entry.lng}`)
      .join("|");
    if (fitted.current === key) return;
    fitted.current = key;
    const bounds = new google.maps.LatLngBounds();
    entries.forEach((entry) => bounds.extend(entry));
    map.current.fitBounds(bounds, {
      top: 120,
      right: 55,
      bottom: 100,
      left: 55,
    });
    const instance = map.current;
    const listener = google.maps.event.addListenerOnce(instance, "idle", () => {
      if ((instance.getZoom() || 0) > 15) instance.setZoom(15);
    });
    return () => listener.remove();
  }, [entries, ready]);

  useEffect(() => {
    if (!ready || !canvas.current) return;
    const observer = new ResizeObserver(() => {
      if (map.current) google.maps.event.trigger(map.current, "resize");
    });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (visitor && ready && map.current) {
      map.current.panTo(visitor);
      map.current.setZoom(12);
    }
  }, [visitor, ready]);

  function fitResults() {
    if (!map.current || !entries.length) return;
    const bounds = new google.maps.LatLngBounds();
    entries.forEach((entry) => bounds.extend(entry));
    map.current.fitBounds(bounds, 80);
  }
  return (
    <div
      className="directory-map"
      data-tiles-loaded={tilesLoaded}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div
        ref={canvas}
        className="directory-map-canvas"
        aria-label={s("map")}
      />
      {!tilesLoaded && !error && (
        <div className="directory-map-loading" role="status">
          <Loader2 className="ob-spin" />
          {s("mapLoading")}
        </div>
      )}
      {error && (
        <div className="directory-map-error" role="status">
          <MapPin size={28} />
          <p>{s("mapError")}</p>
          <button
            type="button"
            onClick={() => {
              setError(false);
              setReady(false);
              setTilesLoaded(false);
              setAttempt((value) => value + 1);
            }}
          >
            {s("retry")}
          </button>
        </div>
      )}
      {ready && !error && (
        <>
          <div className="directory-map-controls" aria-label={s("mapControls")}>
            <button
              type="button"
              onClick={() =>
                map.current?.setZoom(
                  Math.min(20, (map.current.getZoom() || 7) + 1),
                )
              }
              aria-label={s("zoomIn")}
            >
              <Plus size={19} />
            </button>
            <button
              type="button"
              onClick={() =>
                map.current?.setZoom(
                  Math.max(3, (map.current.getZoom() || 7) - 1),
                )
              }
              aria-label={s("zoomOut")}
            >
              <Minus size={19} />
            </button>
            <button
              type="button"
              disabled={!entries.length}
              onClick={fitResults}
              aria-label={s("fitMap")}
            >
              <Expand size={18} />
            </button>
          </div>
          {!entries.length && (
            <p className="directory-map-empty" role="status">
              {s("noMapLocations")}
            </p>
          )}
          {visibleGroup.length > 0 && (
            <section className="directory-map-group" aria-label={s("mapGroup")}>
              <header>
                <strong>
                  {visibleGroup.length} {s("mapGroup")}
                </strong>
                <button
                  type="button"
                  aria-label={s("closeMapPanel")}
                  onClick={() => setGroup([])}
                >
                  <X size={18} />
                </button>
              </header>
              <div>
                {visibleGroup.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    onClick={() => {
                      setGroup([]);
                      callback.current(entry.id);
                    }}
                  >
                    <span>
                      <strong>{entry.name}</strong>
                      <small>{entry.address}</small>
                    </span>
                    <MapPin size={16} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
