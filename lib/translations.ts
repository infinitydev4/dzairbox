import frTranslations from '../locales/fr.json'
import arTranslations from '../locales/ar.json'

type Language = "fr" | "ar"
type Translations = Record<string, any>

const translations: Record<Language, Translations> = {
  fr: frTranslations,
  ar: arTranslations
}

// Fonction pour obtenir la valeur d'une clé imbriquée (ex: "nav.home")
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path
  }, obj)
}

export function getServerTranslation(language: Language = 'fr') {
  return function t(key: string): string {
    return getNestedValue(translations[language], key) || key
  }
}

export function getTranslations(language: Language = 'fr'): Translations {
  return translations[language] || translations.fr
} 