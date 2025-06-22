"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export default function RegisterPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('register.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Option Chat IA - Recommandée */}
          <Card className="relative border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                {t('register.aiChat.recommended')}
              </span>
            </div>
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">
                {t('register.aiChat.title')}
              </CardTitle>
              <CardDescription className="text-emerald-700">
                {t('register.aiChat.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.aiChat.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.aiChat.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.aiChat.feature3')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.aiChat.feature4')}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6">
                  <Link href="/register/chat">
                    {t('register.aiChat.button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-emerald-600 text-center mt-2">
                  {t('register.aiChat.tagline')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Option Formulaire Classique */}
          <Card className="border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {t('register.classicForm.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('register.classicForm.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.classicForm.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.classicForm.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.classicForm.feature3')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('register.classicForm.feature4')}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full text-lg py-6">
                  <Link href="/register/form">
                    {t('register.classicForm.button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('register.classicForm.tagline')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section informative */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              {t('register.whyAi.title')}
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              {t('register.whyAi.description')}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
