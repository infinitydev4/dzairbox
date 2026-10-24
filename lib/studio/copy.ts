import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
export function studioText(language: "fr" | "ar", key: string) {
  const dictionary: Record<string, string> =
    language === "ar" ? ar.studio : fr.studio;
  return dictionary[key] || key;
}
