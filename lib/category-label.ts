import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";
import { normalizeSearchText } from "@/lib/search-normalization";
const extras: Record<string, { fr: string; ar: string }> = {
  artisanat: { fr: "Artisanat", ar: "الصناعات التقليدية" },
  clinique: { fr: "Clinique", ar: "عيادة" },
  entretien: { fr: "Entretien et réparation", ar: "الصيانة والإصلاح" },
  beaute: { fr: "Beauté", ar: "الجمال" },
};
export function categoryLabel(value: string, language: "fr" | "ar") {
  const dictionary: Record<string, string> =
    language === "ar" ? ar.categories : fr.categories;
  const key = Object.keys(fr.categories).find(
    (k) => normalizeSearchText(k) === normalizeSearchText(value),
  );
  return key
    ? dictionary[key]
    : extras[normalizeSearchText(value)]?.[language] || value;
}
