"use client"

import { TemplateKey, BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { SidebarRightTemplate } from "./layouts/sidebar-right"
import { SidebarLeftTemplate } from "./layouts/sidebar-left"
import { HeroFullTemplate } from "./layouts/hero-full"

interface TemplateRendererProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function TemplateRenderer({ business, config }: TemplateRendererProps) {
  // Validate that we have a valid template key
  if (!config || !config.templateKey) {
    console.error("Invalid config or templateKey missing")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Configuration de template invalide</p>
      </div>
    )
  }

  // Render the appropriate template based on templateKey
  switch (config.templateKey) {
    case "sidebar-right":
      return <SidebarRightTemplate business={business} config={config} />
    
    case "sidebar-left":
      return <SidebarLeftTemplate business={business} config={config} />
    
    case "hero-full":
      return <HeroFullTemplate business={business} config={config} />
    
    default:
      // Fallback to sidebar-right if unknown template
      console.warn(`Unknown template key: ${config.templateKey}, falling back to sidebar-right`)
      return <SidebarRightTemplate business={business} config={config} />
  }
}

