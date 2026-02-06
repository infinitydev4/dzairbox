"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { Building2, Home, Search } from "lucide-react"

export default function BusinessNotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="container max-w-2xl px-4">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {t('business.notFound.title')}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              {t('business.notFound.description')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">?</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">{t('business.notFound.whatHappened')}</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• {t('business.notFound.reasons.notActivated')}</li>
                    <li>• {t('business.notFound.reasons.misspelled')}</li>
                    <li>• {t('business.notFound.reasons.removed')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">{t('business.notFound.whatCanYouDo')}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg py-6">
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    {t('business.notFound.homeButton')}
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="text-lg py-6 border-emerald-200 hover:bg-emerald-50">
                  <Link href="/businesses">
                    <Search className="mr-2 h-5 w-5" />
                    {t('business.notFound.searchButton')}
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                <div className="text-center">
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    {t('business.notFound.ownerTitle')}
                  </h4>
                  <p className="text-emerald-700 text-sm mb-4">
                    {t('business.notFound.ownerDescription')}
                  </p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/create-service">
                      {t('business.notFound.registerButton')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 