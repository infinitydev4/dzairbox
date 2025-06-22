"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Building2, 
  MapPin, 
  Clock, 
  Loader2,
  ArrowLeft,
  Save
} from "lucide-react"

interface CreateBusinessManualProps {
  onBack: () => void
}

const businessCategories = [
  "Restaurant", "Boulangerie", "Coiffeur", "Mécanicien", "Électricien",
  "Pharmacie", "Médecin", "Dentiste", "Épicerie", "Vêtements",
  "Informatique", "Plombier", "Peintre", "Avocat", "Comptable"
]

const daysOfWeek = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" }
]

export function CreateBusinessManual({ onBack }: CreateBusinessManualProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    services: "",
    hours: {} as Record<string, string>
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.name || !formData.category || !formData.description || !formData.address || !formData.phone) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Succès !",
          description: result.message || "Entreprise créée avec succès !",
        })
        router.push("/dashboard/businesses")
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création de l'entreprise.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating business:", error)
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Retour</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <span>Informations générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nom de l'entreprise *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Restaurant Chez Ali"
                  className="rounded-xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {businessCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez votre entreprise..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Services proposés
              </label>
              <Input
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                placeholder="Ex: Réparation, Vente, Installation"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <span>Contact et localisation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse complète *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Ex: 123 Rue de la République, Alger"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Téléphone *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+213 123 456 789"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@entreprise.dz"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Site web
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://monentreprise.dz"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-900/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <span>Horaires d'ouverture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {day.label}
                  </label>
                  <Input
                    value={formData.hours[day.key] || ""}
                    onChange={(e) => handleHoursChange(day.key, e.target.value)}
                    placeholder="9h00 - 18h00 ou Fermé"
                    className="rounded-xl"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto rounded-xl"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer l'entreprise
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 