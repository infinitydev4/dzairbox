// Catégories de services
export const businessCategories = [
  // Alimentation & Restauration
  "restaurant", "café", "boulangerie", "pâtisserie", "pizzeria", "fast-food", 
  "traiteur", "épicerie", "supermarché", "boucherie", "poissonnerie", "fromagerie",
  
  // Santé & Bien-être
  "médecin", "dentiste", "pharmacie", "opticien", "kinésithérapeute", "infirmier",
  "laboratoire", "psychologue", "diététicien", "ostéopathe", "sage-femme",
  
  // Beauté & Esthétique
  "coiffeur", "barbier", "esthéticienne", "spa", "massage", "manucure", "maquillage",
  
  // Artisanat & Réparation
  "électricien", "plombier", "mécanicien", "menuisier", "peintre", "maçon",
  "serrurier", "vitrier", "climatisation", "chauffagiste", "carreleur",
  
  // Commerce & Retail
  "vêtements", "chaussures", "bijouterie", "parfumerie", "librairie", "papeterie",
  "électroménager", "meubles", "décoration", "jouets", "sport", "fleuriste",
  
  // Services professionnels
  "avocat", "notaire", "comptable", "architecte", "agence-immobilière", 
  "assurance", "banque", "traduction", "formation",
  
  // Technologie & Digital
  "informatique", "réparation-téléphone", "développement-web", "graphisme",
  "photographie", "vidéographie", "imprimerie",
  
  // Automobile
  "garage", "carrosserie", "lavage-auto", "location-voiture", "pièces-auto",
  
  // Construction & Immobilier
  "promotion-immobilière", "agence-location", "syndic", "déménagement",
  
  // Éducation & Formation
  "école", "université", "cours-particuliers", "crèche", "auto-école",
  
  // Loisirs & Culture
  "salle-sport", "piscine", "cinéma", "théâtre", "musée", "bibliothèque",
  "agence-voyage", "hôtel", "restaurant-événementiel",
  
  // Services à domicile
  "ménage", "jardinage", "garde-enfants", "aide-domicile", "bricolage",
  
  // Autres services
  "pressing", "cordonnerie", "couture", "taxi", "transport", "location-matériel",
  "sécurité", "nettoyage-industriel", "événementiel", "wedding-planner"
] as const

export type BusinessCategory = typeof businessCategories[number]

// Jours de la semaine (clés en anglais pour cohérence avec la base de données)
export const daysOfWeek = [
  { key: "sunday", labelFr: "Dimanche", labelAr: "الأحد" },
  { key: "monday", labelFr: "Lundi", labelAr: "الاثنين" },
  { key: "tuesday", labelFr: "Mardi", labelAr: "الثلاثاء" },
  { key: "wednesday", labelFr: "Mercredi", labelAr: "الأربعاء" },
  { key: "thursday", labelFr: "Jeudi", labelAr: "الخميس" },
  { key: "friday", labelFr: "Vendredi", labelAr: "الجمعة" },
  { key: "saturday", labelFr: "Samedi", labelAr: "السبت" }
] as const

export type DayOfWeek = typeof daysOfWeek[number]["key"]

// Type pour les horaires
export interface DayHours {
  open: string
  close: string
  closed: boolean
}

export type WeekHours = Record<DayOfWeek, DayHours>
