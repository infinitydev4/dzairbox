import { z } from "zod"

// Theme validation schema
const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  gradient: z.object({
    from: z.string(),
    to: z.string()
  }).optional()
})

// Hero section validation
const HeroSchema = z.object({
  enabled: z.boolean(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  backgroundType: z.enum(["color", "gradient", "image"]),
  backgroundValue: z.string(),
  backgroundImage: z.string().url().optional(),
  showCTA: z.boolean()
})

// Sections validation
const SectionsSchema = z.object({
  services: z.object({
    enabled: z.boolean(),
    title: z.string().max(100).optional(),
    display: z.enum(["grid", "list"])
  }),
  about: z.object({
    enabled: z.boolean(),
    content: z.string().max(2000).optional()
  }),
  gallery: z.object({
    enabled: z.boolean(),
    images: z.array(z.string().url()).optional()
  }).optional()
})

// Sidebar validation (not optional for direct use)
const SidebarSchemaRequired = z.object({
  position: z.enum(["left", "right"]),
  contact: z.object({
    phone: z.boolean(),
    email: z.boolean()
  }),
  socials: z.object({
    facebook: z.boolean(),
    instagram: z.boolean(),
    tiktok: z.boolean(),
    youtube: z.boolean()
  }),
  hours: z.object({
    enabled: z.boolean()
  }),
  address: z.object({
    enabled: z.boolean(),
    showMap: z.boolean()
  })
})

// Sidebar validation (optional, only for sidebar templates)
const SidebarSchema = SidebarSchemaRequired.optional()

// Base config schema without refine
const BaseConfigSchema = z.object({
  configVersion: z.number().int().positive().default(1),
  templateKey: z.enum(["sidebar-right", "sidebar-left", "hero-full"]),
  theme: ThemeSchema,
  hero: HeroSchema,
  sections: SectionsSchema,
  sidebar: SidebarSchema
})

// Base config schema with validation
export const BusinessPageConfigSchema = BaseConfigSchema.refine((data) => {
  // Sidebar is required for sidebar templates
  if ((data.templateKey === "sidebar-right" || data.templateKey === "sidebar-left") && !data.sidebar) {
    return false
  }
  return true
}, {
  message: "Sidebar configuration is required for sidebar templates"
})

// Discriminated union for strict template-specific validation
export const SidebarRightConfigSchema = z.object({
  configVersion: z.number().int().positive().optional().default(1),
  templateKey: z.literal("sidebar-right"),
  theme: ThemeSchema,
  hero: HeroSchema,
  sections: SectionsSchema,
  sidebar: SidebarSchemaRequired.extend({
    position: z.literal("right")
  })
})

export const SidebarLeftConfigSchema = z.object({
  configVersion: z.number().int().positive().optional().default(1),
  templateKey: z.literal("sidebar-left"),
  theme: ThemeSchema,
  hero: HeroSchema,
  sections: SectionsSchema,
  sidebar: SidebarSchemaRequired.extend({
    position: z.literal("left")
  })
})

export const HeroFullConfigSchema = z.object({
  configVersion: z.number().int().positive().optional().default(1),
  templateKey: z.literal("hero-full"),
  theme: ThemeSchema,
  hero: HeroSchema,
  sections: SectionsSchema,
  sidebar: z.undefined().optional()
})

// Discriminated union
export const StrictBusinessPageConfigSchema = z.discriminatedUnion("templateKey", [
  SidebarRightConfigSchema,
  SidebarLeftConfigSchema,
  HeroFullConfigSchema
])

// Validation functions
export function validateConfig(config: unknown) {
  return BusinessPageConfigSchema.safeParse(config)
}

export function validateConfigStrict(config: unknown) {
  return StrictBusinessPageConfigSchema.safeParse(config)
}

// Type exports
export type ValidatedConfig = z.infer<typeof BusinessPageConfigSchema>
export type StrictValidatedConfig = z.infer<typeof StrictBusinessPageConfigSchema>

