import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImageToS3 } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP' 
      }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximale: 5MB' 
      }, { status: 400 })
    }

    // Upload vers S3
    console.log("📤 Upload du fichier:", file.name, "Taille:", file.size, "Type:", file.type)
    const imageUrl = await uploadImageToS3(file)

    console.log("✅ Upload réussi, URL:", imageUrl)
    return NextResponse.json({ url: imageUrl })

  } catch (error) {
    console.error('❌ Erreur API upload:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload' 
    }, { status: 500 })
  }
} 