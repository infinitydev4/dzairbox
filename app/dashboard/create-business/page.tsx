"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { 
  Building2, 
  Bot,
  ArrowLeft,
  Zap,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { CreateBusinessManual } from "@/components/dashboard/create-business-manual"
import { CreateBusinessAI } from "@/components/dashboard/create-business-ai"

type CreationMode = "choice" | "manual" | "ai"

export default function CreateBusinessPage() {
  const { t } = useLanguage()
  const [mode, setMode] = useState<CreationMode>("choice")

  if (mode === "manual") {
    return <CreateBusinessManual onBack={() => setMode("choice")} />
  }

  if (mode === "ai") {
    return <CreateBusinessAI onBack={() => setMode("choice")} />
  }

  return (
    <div className="space-y-8">
      {/* Options de création */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option Manuelle */}
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              {t('dashboard.newBusiness.manual.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('dashboard.newBusiness.manual.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.manual.feature1')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.manual.feature2')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.manual.feature3')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.manual.duration')}</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setMode("manual")}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-600/25 rounded-xl mt-6"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('dashboard.newBusiness.manual.button')}
            </Button>
          </CardContent>
        </Card>

        {/* Option IA */}
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Bot className="h-10 w-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              {t('dashboard.newBusiness.ai.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('dashboard.newBusiness.ai.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.ai.feature1')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.ai.feature2')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.ai.feature3')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t('dashboard.newBusiness.ai.duration')}</span>
              </div>
            </div>

            <Button 
              onClick={() => setMode("ai")}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl mt-6"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('dashboard.newBusiness.ai.button')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section d'aide */}
      <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/50 backdrop-blur-sm border border-purple-200/50 shadow-lg shadow-purple-900/5">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center space-x-2">
            <span>💡</span>
            <span>{t('dashboard.newBusiness.help.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <h4 className="font-medium text-purple-900">{t('dashboard.newBusiness.help.manual.title')}</h4>
            <ul className="space-y-2 text-purple-700">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.manual.reason1')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.manual.reason2')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.manual.reason3')}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-purple-900">{t('dashboard.newBusiness.help.ai.title')}</h4>
            <ul className="space-y-2 text-purple-700">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.ai.reason1')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.ai.reason2')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{t('dashboard.newBusiness.help.ai.reason3')}</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 