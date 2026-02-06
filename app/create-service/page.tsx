"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CreateServiceStep1 } from "@/components/create-service/step1-business"
import { CreateServiceStep2 } from "@/components/create-service/step2-user"
import { useLanguage } from "@/components/language-provider"

export default function CreateServicePage() {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [businessData, setBusinessData] = useState<any>(null)
  const [businessToken, setBusinessToken] = useState<string | null>(null)

  const handleStep1Complete = (data: any, token: string) => {
    setBusinessData(data)
    setBusinessToken(token)
    setCurrentStep(2)
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <Header />
      
      <main className="container px-4 py-6 sm:py-12">
        {/* Progress Indicator - Responsive */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          {/* Mobile Version - Vertical */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  currentStep === 1 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  1
                </div>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {t("createService.step1.title")}
                </span>
              </div>
              
              <div className="flex-1 h-1 bg-gray-200 rounded mx-2 mt-[-24px]">
                <div className={`h-full rounded transition-all duration-500 ${
                  currentStep === 2 ? 'w-full bg-gradient-to-r from-emerald-600 to-green-600' : 'w-0'
                }`}></div>
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  currentStep === 2 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 2 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {t("createService.step2.title")}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Version - Horizontal */}
          <div className="hidden sm:flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 1 
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white' 
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 1 ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {t("createService.step1.title")}
              </span>
            </div>
            
            <div className="w-24 h-1 bg-gray-200 rounded">
              <div className={`h-full rounded transition-all duration-500 ${
                currentStep === 2 ? 'w-full bg-gradient-to-r from-emerald-600 to-green-600' : 'w-0'
              }`}></div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 2 
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 2 ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {t("createService.step2.title")}
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <CreateServiceStep1 onComplete={handleStep1Complete} />
        )}
        
        {currentStep === 2 && (
          <CreateServiceStep2 
            businessData={businessData} 
            businessToken={businessToken}
            onBack={handleBack}
          />
        )}
      </main>
      
      <Footer />
    </div>
  )
}
