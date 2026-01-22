export type TemplateKey = "sidebar-right" | "sidebar-left" | "hero-full"

export interface TemplateSchema {
  layout: TemplateKey
  sections: Record<string, SectionConfig>
  theme: ThemeConfig
}

export interface SectionConfig {
  required: boolean
  position?: "left" | "right" | "top" | "bottom"
  fullWidth?: boolean
  customizable: string[]
}

export interface ThemeConfig {
  customizable: string[]
}

export interface BusinessPageConfigData {
  configVersion: number
  templateKey: TemplateKey
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor?: string
    gradient?: { from: string; to: string }
  }
  hero: {
    enabled: boolean
    title?: string // Override du nom business
    description?: string // Override description
    backgroundType: "color" | "gradient" | "image"
    backgroundValue: string
    backgroundImage?: string // URL de l'image de fond pour le hero
    showCTA: boolean
  }
  sections: {
    services: { enabled: boolean; title?: string; display: "grid" | "list" }
    about: { enabled: boolean; content?: string }
    gallery?: { enabled: boolean; images?: string[] }
  }
  sidebar?: {
    position: "left" | "right"
    contact: { phone: boolean; email: boolean }
    socials: { facebook: boolean; instagram: boolean; tiktok: boolean; youtube: boolean }
    hours: { enabled: boolean }
    address: { enabled: boolean; showMap: boolean }
  }
}

// Default configuration helper
export function getDefaultConfig(templateKey: TemplateKey): BusinessPageConfigData {
  const baseConfig: BusinessPageConfigData = {
    configVersion: 1,
    templateKey,
    theme: {
      primaryColor: "#10b981", // emerald-600
      secondaryColor: "#059669", // emerald-700
      gradient: { from: "#10b981", to: "#059669" }
    },
    hero: {
      enabled: true,
      backgroundType: "gradient",
      backgroundValue: "from-emerald-600 via-emerald-700 to-green-600",
      showCTA: true
    },
    sections: {
      services: { enabled: true, display: "grid" },
      about: { enabled: true },
      gallery: { enabled: false, images: [] }
    }
  }

  // Add sidebar config for sidebar templates
  if (templateKey === "sidebar-right" || templateKey === "sidebar-left") {
    baseConfig.sidebar = {
      position: templateKey === "sidebar-right" ? "right" : "left",
      contact: { phone: true, email: true },
      socials: { facebook: true, instagram: true, tiktok: true, youtube: true },
      hours: { enabled: true },
      address: { enabled: true, showMap: true }
    }
  }

  return baseConfig
}

// Type for Business with relations
export interface BusinessWithConfig {
  id: string
  name: string
  description: string | null
  category: string
  address: string
  phone: string | null
  email: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  hours: string | null
  services: string | null
  images: string | null
  heroImage: string | null
  subdomain: string
  isActive: boolean
  userId: string
  templateId: string | null
  useCustomPage: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    name: string | null
    email: string
  }
  pageConfig?: {
    id: string
    config: any // Will be parsed as BusinessPageConfigData
    draft: any | null
    configVersion: number
    publishedAt: Date | null
  } | null
  template?: {
    id: string
    key: string
    name: string
    schema: any
  } | null
}

