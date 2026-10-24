"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, RotateCcw, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
export function StudioUpload({
  businessId,
  value,
  onChange,
  label,
}: {
  businessId: string;
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const { t } = useLanguage();
  const s = (k: string) => t(`studio.${k}`);
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const request = useRef<XMLHttpRequest | null>(null);
  const commit = useRef(onChange);
  useEffect(() => {
    commit.current = onChange;
  }, [onChange]);
  useEffect(
    () => () => {
      request.current?.abort();
    },
    [],
  );
  function send(file: File) {
    fileRef.current = file;
    setFailed(false);
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setFailed(true);
      return;
    }
    const xhr = new XMLHttpRequest();
    request.current = xhr;
    xhr.open("POST", "/api/upload");
    setProgress(0);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && result.url) {
          commit.current(result.url);
          if (inputRef.current) inputRef.current.value = "";
        } else setFailed(true);
      } catch {
        setFailed(true);
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setFailed(true);
    };
    xhr.timeout = 90000;
    xhr.ontimeout = xhr.onerror;
    const data = new FormData();
    data.append("file", file);
    data.append("businessId", businessId);
    xhr.send(data);
  }
  return (
    <div className="st-upload">
      <span className="st-label">{label}</span>
      {value && (
        <div className="st-upload-thumb">
          <Image src={value} alt={label} fill unoptimized sizes="250px" />
          <button
            type="button"
            aria-label={s("remove")}
            onClick={() => onChange("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <label className="st-upload-button">
        <Upload size={16} />
        {progress !== null ? `${s("uploading")} ${progress}%` : s("upload")}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={progress !== null}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) send(file);
          }}
        />
      </label>
      <small>{s("uploadHelp")}</small>
      {progress !== null && <progress max={100} value={progress} />}{" "}
      {failed && (
        <div className="st-error" role="alert">
          {s("uploadError")}
          {
            <button type="button" onClick={() => send(fileRef.current!)}>
              <RotateCcw size={13} />
              {s("retry")}
            </button>
          }
        </div>
      )}
    </div>
  );
}
