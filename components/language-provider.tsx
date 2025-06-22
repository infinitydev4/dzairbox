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
        // Fallback vers les traductions intégrées
        translations = {
          fr: {
            "nav.home": "Accueil",
            "nav.services": "Services",
            "nav.about": "À propos",
            "nav.contact": "Contact",
            "nav.login": "Connexion",
            "hero.title": "Développez votre activité locale en Algérie",
            "hero.subtitle": "Rejoignez des milliers d'entreprises qui font confiance à notre plateforme pour développer leur visibilité en ligne",
            "hero.register": "Inscrire mon entreprise",
            "hero.find": "Trouver un service",
            "features.title": "Pourquoi choisir DzBusiness ?",
            "features.visibility.title": "Visibilité maximale",
            "features.visibility.desc": "Votre entreprise visible 24h/24 sur internet",
            "features.seo.title": "SEO local optimisé",
            "features.seo.desc": "Référencement optimisé pour l'Algérie",
            "features.mobile.title": "Mobile-first",
            "features.mobile.desc": "Interface parfaitement adaptée aux mobiles",
            "services.title": "Services populaires",
            "services.electrician": "Électriciens",
            "services.mechanic": "Mécaniciens",
            "services.pharmacy": "Pharmacies",
            "services.grocery": "Épiceries",
            "services.bakery": "Boulangeries",
            "services.restaurant": "Restaurants",
            "chatbot.welcome": "Bonjour ! Je vais vous aider à inscrire votre entreprise. Commençons par le nom de votre entreprise.",
            "chatbot.placeholder": "Tapez votre message...",
            "chatbot.send": "Envoyer",
          },
          ar: {
            "nav.home": "الرئيسية",
            "nav.services": "الخدمات",
            "nav.about": "حولنا",
            "nav.contact": "اتصل بنا",
            "nav.login": "تسجيل الدخول",
            "hero.title": "طور نشاطك المحلي في الجزائر",
            "hero.subtitle": "انضم إلى آلاف الشركات التي تثق في منصتنا لتطوير ظهورها على الإنترنت",
            "hero.register": "سجل شركتي",
            "hero.find": "ابحث عن خدمة",
            "features.title": "لماذا تختار DzBusiness؟",
            "features.visibility.title": "أقصى ظهور",
            "features.visibility.desc": "شركتك مرئية 24/7 على الإنترنت",
            "features.seo.title": "SEO محلي محسن",
            "features.seo.desc": "تحسين محركات البحث للجزائر",
            "features.mobile.title": "الجوال أولاً",
            "features.mobile.desc": "واجهة مثالية للهواتف المحمولة",
            "services.title": "الخدمات الشائعة",
            "services.electrician": "كهربائيون",
            "services.mechanic": "ميكانيكيون",
            "services.pharmacy": "صيدليات",
            "services.grocery": "بقالات",
            "services.bakery": "مخابز",
            "services.restaurant": "مطاعم",
            "chatbot.welcome": "مرحباً! سأساعدك في تسجيل شركتك. لنبدأ باسم شركتك.",
            "chatbot.placeholder": "اكتب رسالتك...",
            "chatbot.send": "إرسال",
          },
        }
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
    return <div>Loading...</div>
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
