import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedImageUrl } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL d\'image requise' }, { status: 400 })
    }

    // Générer l'URL pré-signée
    const signedUrl = await getSignedImageUrl(imageUrl)

    return NextResponse.json({ signedUrl })

  } catch (error) {
    console.error('❌ Erreur API signed-url:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la génération de l\'URL' 
    }, { status: 500 })
  }
} 