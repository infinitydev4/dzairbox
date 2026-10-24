type SearchableBusiness = {
  name: string;
  category: string;
  address: string;
  description: string | null;
};

type SearchAlias = {
  arabic: readonly string[];
  french: readonly string[];
  field: "category" | "city";
};

// Only unambiguous, common service terms are translated. Other words remain
// ordinary free text, so names and descriptions keep their original meaning.
const searchAliases: readonly SearchAlias[] = [
  { arabic: ["مطعم", "مطاعم"], french: ["restaurant"], field: "category" },
  { arabic: ["مقهى", "مقاهي"], french: ["café"], field: "category" },
  {
    arabic: ["مخبز", "مخبزة", "مخابز"],
    french: ["boulangerie"],
    field: "category",
  },
  { arabic: ["صيدلية", "صيدليات"], french: ["pharmacie"], field: "category" },
  {
    arabic: ["طبيب أسنان", "طبيبة أسنان"],
    french: ["dentiste"],
    field: "category",
  },
  { arabic: ["طبيب", "طبيبة"], french: ["médecin"], field: "category" },
  {
    arabic: ["حلاق", "حلاقة"],
    french: ["coiffeur", "barbier"],
    field: "category",
  },
  { arabic: ["كهربائي"], french: ["électricien"], field: "category" },
  { arabic: ["سباك"], french: ["plombier"], field: "category" },
  { arabic: ["ميكانيكي"], french: ["mécanicien"], field: "category" },
  { arabic: ["فندق", "فنادق"], french: ["hôtel"], field: "category" },
  { arabic: ["كراج", "مرآب"], french: ["garage"], field: "category" },
  { arabic: ["صالون تجميل"], french: ["salon de beauté"], field: "category" },
  {
    arabic: ["نادي رياضي", "قاعة رياضة"],
    french: ["salle de sport"],
    field: "category",
  },
  { arabic: ["الجزائر العاصمة", "الجزائر"], french: ["Alger"], field: "city" },
  { arabic: ["وهران"], french: ["Oran"], field: "city" },
  { arabic: ["قسنطينة"], french: ["Constantine"], field: "city" },
  { arabic: ["عنابة"], french: ["Annaba"], field: "city" },
  { arabic: ["بليدة", "البليدة"], french: ["Blida"], field: "city" },
  { arabic: ["تيزي وزو"], french: ["Tizi Ouzou"], field: "city" },
  { arabic: ["بجاية"], french: ["Béjaïa"], field: "city" },
  { arabic: ["سطيف"], french: ["Sétif"], field: "city" },
  { arabic: ["تلمسان"], french: ["Tlemcen"], field: "city" },
];

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const normalizedAliases = searchAliases
  .flatMap((group) =>
    group.arabic.map((arabic) => ({
      words: normalizeSearchText(arabic).split(" "),
      french: group.french.map(normalizeSearchText),
      field: group.field,
    })),
  )
  .sort((a, b) => b.words.length - a.words.length);

function containsPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `);
}

function matchesCity(address: string, names: readonly string[]): boolean {
  const parts = address.split(",").map(normalizeSearchText).filter(Boolean);
  const last = parts.at(-1);
  const locality =
    last === "algerie" || last === "algeria" || last === "الجزاير"
      ? parts.at(-2)
      : last;
  const candidates = [parts[0], locality].filter((part): part is string =>
    Boolean(part),
  );

  return candidates.some((candidate) => {
    const city = candidate.replace(/^(?:wilaya|province) (?:de |d )?/, "");
    return names.some((name) => city === name || city.startsWith(`${name} `));
  });
}

export function createBusinessSearchMatcher(
  query: string,
): (business: SearchableBusiness) => boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return () => true;

  const words = normalizedQuery.split(" ");
  const clauses: Array<{
    phrase: string;
    field?: "category" | "city";
    french?: readonly string[];
  }> = [];
  let freeWords: string[] = [];
  let translated = false;

  const flushFreeWords = () => {
    if (freeWords.length) clauses.push({ phrase: freeWords.join(" ") });
    freeWords = [];
  };

  for (let i = 0; i < words.length; ) {
    const alias = normalizedAliases.find(({ words: aliasWords }) =>
      aliasWords.every((word, offset) => words[i + offset] === word),
    );

    if (alias) {
      flushFreeWords();
      clauses.push({
        phrase: alias.words.join(" "),
        field: alias.field,
        french: alias.french,
      });
      translated = true;
      i += alias.words.length;
    } else {
      freeWords.push(words[i]);
      i += 1;
    }
  }
  flushFreeWords();

  return (business) => {
    const category = normalizeSearchText(business.category);
    const fields = [
      business.name,
      business.category,
      business.address,
      business.description ?? "",
    ].map(normalizeSearchText);

    // Keep the existing free-text search behavior, including exact phrases.
    if (fields.some((field) => field.includes(normalizedQuery))) return true;
    if (!translated) return false;

    return clauses.every((clause) => {
      if (clause.phrase === "في") return true; // Arabic connector: “in [city]”
      if (!clause.field)
        return fields.some((field) => field.includes(clause.phrase));
      if (clause.field === "category") {
        return (
          clause.french?.some((name) => containsPhrase(category, name)) ?? false
        );
      }
      return matchesCity(business.address, clause.french ?? []);
    });
  };
}

// A query becomes AND clauses, each with bilingual alternatives; the database paginates.
export function directorySearchClauses(query: string): string[][] {
  const words = normalizeSearchText(query).split(" ").filter(Boolean);
  const clauses: string[][] = [];
  for (let i = 0; i < words.length; ) {
    const alias = normalizedAliases.find((a) =>
      a.words.every((word, offset) => words[i + offset] === word),
    );
    if (alias) {
      clauses.push([alias.words.join(" "), ...alias.french]);
      i += alias.words.length;
    } else {
      if (words[i] !== "في") clauses.push([words[i]]);
      i++;
    }
  }
  return clauses;
}
