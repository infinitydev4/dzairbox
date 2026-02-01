import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedImageUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL d\'image requise' }, { status: 400 })
    }

    // Vérifier que c'est bien une URL S3 de notre bucket
    if (!imageUrl.includes('dzairbox.s3.') && !imageUrl.includes('amazonaws.com')) {
      return NextResponse.json({ error: 'URL non autorisée' }, { status: 403 })
    }

    try {
      // Obtenir l'URL pré-signée
      const signedUrl = await getSignedImageUrl(imageUrl)
      
      // Faire la requête vers S3 côté serveur
      const response = await fetch(signedUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'public, max-age=31536000',
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur S3: ${response.status}`)
      }

      // Récupérer les données de l'image
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'

      // Retourner l'image avec les bons headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })

    } catch (error) {
      console.error('❌ Erreur proxy image:', error)
      return NextResponse.json({ 
        error: 'Erreur lors du chargement de l\'image' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erreur API proxy:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
} 