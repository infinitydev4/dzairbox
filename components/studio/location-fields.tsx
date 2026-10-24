"use client";
import { useEffect, useState } from "react";
import wilayas from "@/data/locations/wilayas.json";
import { useLanguage } from "@/components/language-provider";
import type { BusinessLocation } from "@/lib/studio/document";
type Commune = {
  code: string;
  wilayaCode: string;
  fr: string;
  ar: string;
  lat: number;
  lng: number;
};
export function LocationFields({
  value,
  onChange,
  multiple = false,
}: {
  value: BusinessLocation;
  onChange: (l: BusinessLocation) => void;
  multiple?: boolean;
}) {
  const { language, t } = useLanguage();
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (value.wilayaCode)
      fetch(`/api/locations?wilaya=${value.wilayaCode}`, {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => {
          setCommunes(data.communes);
          setError(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(true);
        });
    return () => controller.abort();
  }, [value.wilayaCode, attempt]);
  const s = (key: string) => t(`studio.${key}`);
  return (
    <div className="st-location-fields">
      <div className="st-segment">
        {(["establishment", "area"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={value.mode === mode}
            onClick={() =>
              onChange({
                ...value,
                mode,
                address: mode === "area" ? "" : value.address,
                point: null,
                placeId: undefined,
                geocodeExpiresAt: undefined,
              })
            }
          >
            {s(mode)}
          </button>
        ))}
      </div>
      <div className="st-form-grid">
        <label>
          {s("wilaya")} *
          <select
            value={value.wilayaCode}
            onChange={(e) =>
              onChange({
                ...value,
                wilayaCode: e.target.value,
                communeCode: "",
                areas: [],
                point: null,
                placeId: undefined,
                geocodeExpiresAt: undefined,
              })
            }
          >
            <option value="">{s("choose")}</option>
            {wilayas.map((w) => (
              <option key={w.code} value={String(w.code).padStart(2, "0")}>
                {String(w.code).padStart(2, "0")} ·{" "}
                {language === "ar" ? w.name_ar : w.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s("commune")} *
          <select
            value={value.communeCode}
            disabled={!value.wilayaCode || error}
            onChange={(e) => {
              const c = communes.find((c) => c.code === e.target.value);
              onChange({
                ...value,
                communeCode: e.target.value,
                point:
                  value.mode === "area" && c
                    ? { lat: c.lat, lng: c.lng, source: "commune" }
                    : null,
              });
            }}
          >
            <option value="">{s("choose")}</option>
            {communes.map((c) => (
              <option value={c.code} key={c.code}>
                {c[language]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <button
          type="button"
          className="st-link"
          onClick={() => setAttempt((v) => v + 1)}
        >
          {s("retry")}
        </button>
      )}
      {value.mode === "establishment" ? (
        <label>
          {s("address")} *
          <input
            autoComplete="street-address"
            value={value.address}
            maxLength={300}
            onChange={(e) =>
              onChange({
                ...value,
                address: e.target.value,
                point: null,
                placeId: undefined,
                geocodeExpiresAt: undefined,
              })
            }
            placeholder={s("addressExample")}
          />
        </label>
      ) : (
        <p className="st-help">{s("areaHelp")}</p>
      )}
      {multiple && value.mode === "area" && (
        <label>
          {s("areas")}
          <select
            multiple
            aria-label={s("areas")}
            value={value.areas}
            onChange={(e) =>
              onChange({
                ...value,
                areas: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
          >
            {communes.map((c) => (
              <option value={c.code} key={c.code}>
                {c[language]}
              </option>
            ))}
          </select>
          <small>{s("areasHelp")}</small>
        </label>
      )}
    </div>
  );
}
