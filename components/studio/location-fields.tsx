"use client";
import { useEffect, useState } from "react";
import { OptionPicker } from "@/components/option-picker";
import { useLanguage } from "@/components/language-provider";
import { allWilayas } from "@/lib/locations";
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
          <OptionPicker
            label={s("wilaya")}
            placeholder={s("choose")}
            value={value.wilayaCode}
            onValueChange={(wilayaCode) =>
              onChange({
                ...value,
                wilayaCode,
                communeCode: "",
                areas: [],
                point: null,
                placeId: undefined,
                geocodeExpiresAt: undefined,
              })
            }
            options={allWilayas.map((wilaya) => ({
              value: wilaya.code,
              label: `${wilaya.code} · ${wilaya[language]}`,
            }))}
          />
        </label>
        <label>
          {s("commune")} *
          <OptionPicker
            label={s("commune")}
            placeholder={s("choose")}
            value={value.communeCode}
            disabled={!value.wilayaCode || error}
            onValueChange={(communeCode) => {
              const commune = communes.find((item) => item.code === communeCode);
              onChange({
                ...value,
                communeCode,
                point:
                  value.mode === "area" && commune
                    ? { lat: commune.lat, lng: commune.lng, source: "commune" }
                    : null,
              });
            }}
            options={communes.map((commune) => ({
              value: commune.code,
              label: commune[language],
            }))}
          />
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
          <OptionPicker
            multiple
            label={s("areas")}
            placeholder={s("choose")}
            value={value.areas}
            onValueChange={(areas) => onChange({ ...value, areas })}
            options={communes.map((commune) => ({
              value: commune.code,
              label: commune[language],
            }))}
          />
          <small>{s("areasHelp")}</small>
        </label>
      )}
    </div>
  );
}
