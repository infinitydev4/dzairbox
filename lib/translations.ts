import frTranslations from '../locales/fr.json'
import arTranslations from '../locales/ar.json'

type Language = "fr" | "ar"
type TranslationTree = { [key: string]: string | TranslationTree }

const translations: Record<Language, TranslationTree> = {
  fr: frTranslations,
  ar: arTranslations
}

function getNestedValue(obj: TranslationTree | string | undefined, path: string): string {
  const result = path.split('.').reduce<TranslationTree | string | undefined>((current, key) => {
    if (!current || typeof current === "string") return undefined
    return current[key]
  }, obj)
  return typeof result === "string" ? result : path
}

export function getServerTranslation(language: Language = 'fr') {
  return function t(key: string): string {
    return getNestedValue(translations[language], key) || key
  }
}

export function getTranslations(language: Language = 'fr'): TranslationTree {
  return translations[language] || translations.fr
} 