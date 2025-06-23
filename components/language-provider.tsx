"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "fr" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

let translations: Record<Language, any> = {
  fr: {},
  ar: {}
}

// Fonction pour obtenir la valeur d'une clé imbriquée (ex: "nav.home")
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path
  }, obj)
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Charger les traductions
    const loadTranslations = async () => {
      try {
        const [frData, arData] = await Promise.all([
          import('../locales/fr.json'),
          import('../locales/ar.json')
        ])
        
        translations.fr = frData.default || frData
        translations.ar = arData.default || arData
        setIsLoaded(true)
      } catch (error) {
        console.error('Erreur lors du chargement des traductions:', error)
        // En cas d'erreur, on garde les traductions vides et on définit isLoaded à true
        // pour éviter les blocages, les clés non trouvées retourneront la clé elle-même
        setIsLoaded(true)
      }
    }

    loadTranslations()

    // Charger la langue sauvegardée
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "fr" || savedLang === "ar")) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }

  const t = (key: string): string => {
    if (!isLoaded) return key
    return getNestedValue(translations[language], key) || key
  }

  // Éviter le rendu jusqu'à ce que les traductions soient chargées
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

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
