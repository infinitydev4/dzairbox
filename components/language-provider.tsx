"use client"

import { createContext, useCallback, useContext, useSyncExternalStore, useEffect, type ReactNode } from "react"
import frData from "@/locales/fr.json"
import arData from "@/locales/ar.json"

type Language = "fr" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

type TranslationTree = { [key: string]: string | TranslationTree }

const translations: Record<Language, TranslationTree> = {
  fr: frData,
  ar: arData
}

function getNestedValue(obj: TranslationTree | string | undefined, path: string): string {
  const result = path.split(".").reduce<TranslationTree | string | undefined>((current, key) => {
    if (!current || typeof current === "string") return undefined
    return current[key]
  }, obj)
  return typeof result === "string" ? result : path
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getSavedLanguage(): Language {
  const saved = localStorage.getItem("language")
  return saved === "ar" ? "ar" : "fr"
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener("dzairbox-language-change", callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener("dzairbox-language-change", callback)
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribeToLanguage, getSavedLanguage, () => "fr")

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem("language", lang)
    window.dispatchEvent(new Event("dzairbox-language-change"))
  }

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language], key) || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      <div className={language === "ar" ? "font-arabic" : "font-inter"} dir={language === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
