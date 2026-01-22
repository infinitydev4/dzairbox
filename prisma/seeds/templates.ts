import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const templateSeeds = [
  {
    key: "sidebar-right",
    name: "Template Sidebar Droite",
    description: "Layout classique avec sidebar fixe à droite (template actuel v1)",
    version: "1.0",
    schema: {
      layout: "sidebar-right",
      sections: {
        hero: { 
          required: true, 
          customizable: ["title", "description", "background", "gradient", "image"]
        },
        services: { 
          required: false, 
          customizable: ["title", "items", "display"]
        },
        about: { 
          required: false, 
          customizable: ["content"]
        },
        gallery: {
          required: false,
          customizable: ["images"]
        },
        sidebar: { 
          required: true, 
          position: "right",
          customizable: ["contact", "socials", "hours", "address"]
        }
      },
      theme: {
        customizable: ["primaryColor", "secondaryColor", "gradient"]
      }
    },
    preview: "/templates/sidebar-right-preview.png",
    isActive: true
  },
  {
    key: "sidebar-left",
    name: "Template Sidebar Gauche",
    description: "Layout moderne avec sidebar à gauche, contenu principal au centre",
    version: "1.0",
    schema: {
      layout: "sidebar-left",
      sections: {
        hero: { 
          required: true, 
          customizable: ["title", "description", "background", "gradient", "image"]
        },
        services: { 
          required: false, 
          customizable: ["title", "items", "display"]
        },
        about: { 
          required: false, 
          customizable: ["content"]
        },
        gallery: {
          required: false,
          customizable: ["images"]
        },
        sidebar: { 
          required: true, 
          position: "left",
          customizable: ["contact", "socials", "hours", "address"]
        }
      },
      theme: {
        customizable: ["primaryColor", "secondaryColor", "gradient"]
      }
    },
    preview: "/templates/sidebar-left-preview.png",
    isActive: true
  },
  {
    key: "hero-full",
    name: "Template Hero Complet",
    description: "Layout sans sidebar permanent, hero pleine largeur avec sections empilées",
    version: "1.0",
    schema: {
      layout: "hero-full",
      sections: {
        hero: { 
          required: true, 
          fullWidth: true,
          customizable: ["title", "description", "background", "cta", "gradient", "image"]
        },
        contact: { 
          required: true, 
          customizable: ["fields", "layout"]
        },
        services: { 
          required: false, 
          customizable: ["title", "items", "grid"]
        },
        about: { 
          required: false, 
          customizable: ["content", "images"]
        },
        gallery: {
          required: false,
          customizable: ["images"]
        },
        hours: { 
          required: false, 
          customizable: ["display"]
        },
        location: { 
          required: false, 
          customizable: ["map", "address"]
        }
      },
      theme: {
        customizable: ["primaryColor", "secondaryColor", "accent", "gradient"]
      }
    },
    preview: "/templates/hero-full-preview.png",
    isActive: true
  }
]

export async function seedTemplates() {
  console.log('🎨 Seeding templates...')
  
  for (const template of templateSeeds) {
    await prisma.template.upsert({
      where: { key: template.key },
      update: template,
      create: template
    })
    console.log(`  ✓ Template "${template.name}" seeded`)
  }
  
  console.log('✨ Templates seeding complete!')
}

