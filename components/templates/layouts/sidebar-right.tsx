"use client"

import { BusinessPageConfigData, BusinessWithConfig } from "@/types/template"
import { HeroSection } from "../sections/hero-section"
import { ServicesSection } from "../sections/services-section"
import { AboutSection } from "../sections/about-section"
import { GallerySection } from "../sections/gallery-section"
import { ContactSidebar } from "../sections/contact-sidebar"

interface SidebarRightTemplateProps {
  business: BusinessWithConfig
  config: BusinessPageConfigData
}

export function SidebarRightTemplate({ business, config }: SidebarRightTemplateProps) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50"
      style={{
        '--primary': config.theme.primaryColor,
        '--secondary': config.theme.secondaryColor
      } as React.CSSProperties}
    >
      {/* Hero Section */}
      <HeroSection business={business} config={config} />

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <ServicesSection business={business} config={config} />
            <AboutSection business={business} config={config} />
            <GallerySection business={business} config={config} />
          </div>

          {/* Right Column - Contact & Info (Sticky) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ContactSidebar business={business} config={config} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200 mt-12">
        <p className="text-gray-600 mb-2">
          Cette page est hébergée sur DzBox
        </p>
        <div className="flex items-center justify-center space-x-4">
          <a 
            href="https://dzbusiness.dz" 
            className="font-medium transition-colors hover:underline"
            style={{ 
              color: config.theme.primaryColor 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = config.theme.secondaryColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = config.theme.primaryColor
            }}
          >
            Créer ma page entreprise
          </a>
        </div>
      </div>
    </div>
  )
}

