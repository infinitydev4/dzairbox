import crypto from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration AWS S3 avec les bonnes variables d'environnement
const s3Client = new S3Client({
  region: process.env.DZAIRBOX_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.DZAIRBOX_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.DZAIRBOX_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.DZAIRBOX_AWS_S3_BUCKET_NAME!;

// New uploads use a dedicated prefix; keep it private in the bucket policy.
export async function uploadImageToS3(file: File): Promise<string> {
  const extension = file.name.split(".").pop();
  const key = `private/business-media/${crypto.randomUUID()}.${extension}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "private, max-age=60",
    }),
  );
  return `https://${BUCKET_NAME}.s3.${process.env.DZAIRBOX_AWS_REGION}.amazonaws.com/${key}`;
}

// Fonction pour supprimer une image de S3
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Extraire le nom du fichier de l'URL
    const url = new URL(imageUrl);
    const fileName = url.pathname.substring(1); // Enlever le '/' du début

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
    console.log("✅ Image supprimée de S3:", fileName);
  } catch (error) {
    console.error("❌ Erreur suppression S3:", error);
    throw new Error("Failed to delete image");
  }
}

// Fonction pour générer une URL pré-signée (pour les uploads directs depuis le client)
export async function generatePresignedUrl(
  fileName: string,
  contentType: string,
): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `business-images/${timestamp}-${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // 1 heure
    return presignedUrl;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL pré-signée:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

// Fonction utilitaire pour valider les types de fichiers
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Fichier trop volumineux. Maximum 5MB.",
    };
  }

  return { isValid: true };
}

export async function getSignedImageUrl(imageUrl: string): Promise<string> {
  try {
    // Extraire le nom du fichier de l'URL
    const url = new URL(imageUrl);
    const fileName = url.pathname.substring(1); // Enlever le '/' du début

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    // Générer une URL pré-signée valide pour 1 heure
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    console.log("✅ URL pré-signée générée pour:", fileName);
    return signedUrl;
  } catch (error) {
    console.error("❌ Erreur génération URL pré-signée:", error);
    return imageUrl; // Fallback vers l'URL originale
  }
}
