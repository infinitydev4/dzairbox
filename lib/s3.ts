import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuration AWS S3 avec les bonnes variables d'environnement
const s3Client = new S3Client({
  region: process.env.DZAIRBOX_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.DZAIRBOX_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.DZAIRBOX_AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.DZAIRBOX_AWS_S3_BUCKET_NAME!

// Fonction pour uploader une image vers S3
export async function uploadImageToS3(file: File): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `business-images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      // Essayer de rendre l'objet public en lecture
      ACL: 'public-read',
      CacheControl: 'max-age=31536000',
      Metadata: {
        'uploaded-by': 'dzairbox',
        'upload-date': new Date().toISOString()
      }
    })

    try {
      await s3Client.send(command)
      console.log("✅ Image uploadée sur S3 avec ACL public-read")
    } catch (aclError) {
      console.warn("⚠️ Impossible d'utiliser ACL public-read, essai sans ACL:", aclError)
      // Retry sans ACL
      const commandWithoutACL = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: 'max-age=31536000',
        Metadata: {
          'uploaded-by': 'dzairbox',
          'upload-date': new Date().toISOString()
        }
      })
      await s3Client.send(commandWithoutACL)
      console.log("✅ Image uploadée sur S3 sans ACL")
    }

    // Retourner l'URL standard (on générera les URLs pré-signées à la demande)
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.DZAIRBOX_AWS_REGION}.amazonaws.com/${fileName}`
    
    console.log("✅ Image uploadée sur S3:", imageUrl)
    return imageUrl

  } catch (error) {
    console.error("❌ Erreur upload S3:", error)
    throw new Error("Failed to upload image")
  }
}

// Fonction pour supprimer une image de S3
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Extraire le nom du fichier de l'URL
    const url = new URL(imageUrl)
    const fileName = url.pathname.substring(1) // Enlever le '/' du début

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    await s3Client.send(command)
    console.log("✅ Image supprimée de S3:", fileName)

  } catch (error) {
    console.error("❌ Erreur suppression S3:", error)
    throw new Error("Failed to delete image")
  }
}

// Fonction pour générer une URL pré-signée (pour les uploads directs depuis le client)
export async function generatePresignedUrl(fileName: string, contentType: string): Promise<string> {
  try {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `business-images/${timestamp}-${randomString}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 heure
    return presignedUrl
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL pré-signée:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

// Fonction utilitaire pour valider les types de fichiers
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Fichier trop volumineux. Maximum 5MB.'
    }
  }

  return { isValid: true }
}

export async function getSignedImageUrl(imageUrl: string): Promise<string> {
  try {
    // Extraire le nom du fichier de l'URL
    const url = new URL(imageUrl)
    const fileName = url.pathname.substring(1) // Enlever le '/' du début

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    // Générer une URL pré-signée valide pour 1 heure
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    console.log("✅ URL pré-signée générée pour:", fileName)
    return signedUrl

  } catch (error) {
    console.error("❌ Erreur génération URL pré-signée:", error)
    return imageUrl // Fallback vers l'URL originale
  }
} 