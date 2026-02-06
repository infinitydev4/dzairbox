"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Header } from "@/components/header"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Building2,
  HeadphonesIcon,
  HandHeart,
  HelpCircle
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const { t, language } = useLanguage()
  const { data: session } = useSession()
  const isRTL = language === "ar"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  })
  const createServiceUrl = session ? '/dashboard/create-business' : '/create-service'

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'general',
          message: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqItems = [
    {
      question: t('contactPage.faq.items.pricing.question'),
      answer: t('contactPage.faq.items.pricing.answer')
    },
    {
      question: t('contactPage.faq.items.setup.question'),
      answer: t('contactPage.faq.items.setup.answer')
    },
    {
      question: t('contactPage.faq.items.support.question'),
      answer: t('contactPage.faq.items.support.answer')
    },
    {
      question: t('contactPage.faq.items.payment.question'),
      answer: t('contactPage.faq.items.payment.answer')
    }
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('contactPage.title')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('contactPage.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('contactPage.hero.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <span>{t('contactPage.form.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">{t('contactPage.form.success')}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">{t('contactPage.form.error')}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <span>{t('contactPage.form.name.label')}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('contactPage.form.name.placeholder')}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-emerald-600" />
                        <span>{t('contactPage.form.email.label')}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('contactPage.form.email.placeholder')}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span>{t('contactPage.form.phone.label')}</span>
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={t('contactPage.form.phone.placeholder')}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        <span>{t('contactPage.form.subject.label')}</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full h-12 px-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:outline-none"
                        required
                      >
                        <option value="general">{t('contactPage.form.subject.options.general')}</option>
                        <option value="business">{t('contactPage.form.subject.options.business')}</option>
                        <option value="support">{t('contactPage.form.subject.options.support')}</option>
                        <option value="partnership">{t('contactPage.form.subject.options.partnership')}</option>
                        <option value="other">{t('contactPage.form.subject.options.other')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <span>{t('contactPage.form.message.label')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={t('contactPage.form.message.placeholder')}
                      className="w-full h-32 px-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 text-lg rounded-xl shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                        {t('contactPage.form.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        {t('contactPage.form.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <span>{t('contactPage.info.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('contactPage.info.address.title')}</h4>
                    <p className="text-gray-600">{t('contactPage.info.address.value')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('contactPage.info.email.title')}</h4>
                    <a href="mailto:contact@dzairbox.com" className="text-emerald-600 hover:text-emerald-700">
                      {t('contactPage.info.email.value')}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('contactPage.info.phone.title')}</h4>
                    <p className="text-gray-600">{t('contactPage.info.phone.value')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('contactPage.info.hours.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('contactPage.info.hours.weekdays')}</p>
                    <p className="text-gray-600 text-sm">{t('contactPage.info.hours.weekend')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <span>{t('contactPage.faq.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">{item.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 border-0 shadow-2xl">
          <CardContent className="p-12 text-center text-white">
            <div className="p-4 bg-white/20 rounded-full w-fit mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              {t('contactPage.cta.title')}
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('contactPage.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-3">
                <Link href={createServiceUrl}>
                  <Building2 className="h-5 w-5 mr-2" />
                  {t('contactPage.cta.createBusiness')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-white hover:text-emerald-600 text-lg px-8 py-3">
                <Link href="/services">
                  <HeadphonesIcon className="h-5 w-5 mr-2" />
                  {t('contactPage.cta.exploreServices')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 