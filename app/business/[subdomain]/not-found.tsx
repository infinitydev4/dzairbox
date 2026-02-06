import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Entreprise non trouvée
              </CardTitle>
              <p className="text-lg text-gray-600">
                L'entreprise que vous recherchez n'existe pas ou n'est plus active.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Que pouvez-vous faire ?
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Vérifiez l'orthographe du nom de l'entreprise</li>
                  <li>• L'entreprise peut être en cours de validation</li>
                  <li>• Explorez notre annuaire d'entreprises</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/" className="flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
                
                <Button asChild variant="outline">
                  <Link href="/businesses" className="flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Parcourir les entreprises
                  </Link>
                </Button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Vous êtes propriétaire d'une entreprise ?{" "}
                  <Link href="/create-service" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Inscrivez-vous gratuitement
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 