import { prisma } from "@/lib/prisma";
import { getSignedImageUrl } from "@/lib/s3";

// Compatibility for historical S3 URLs. New private uploads must always go through
// /api/media/[id], including when an old editor asks for a signed URL.
export async function resolveLegacyImage(
  raw: unknown,
  userId?: string,
): Promise<string | null> {
  if (typeof raw !== "string") return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = `${process.env.DZAIRBOX_AWS_S3_BUCKET_NAME}.s3.${process.env.DZAIRBOX_AWS_REGION}.amazonaws.com`;
  if (
    url.protocol !== "https:" ||
    url.hostname !== host ||
    url.username ||
    url.password
  )
    return null;
  url.search = "";
  url.hash = "";
  const media = await prisma.businessMedia.findFirst({
    where: { storageUrl: url.href },
    select: { id: true, userId: true },
  });
  if (media) return media.userId === userId ? `/api/media/${media.id}` : null;
  const reference = {
    OR: [
      { heroImage: raw },
      { images: { contains: raw } },
      {
        pageConfig: {
          is: { config: { path: ["hero", "backgroundImage"], equals: raw } },
        },
      },
      {
        pageConfig: {
          is: {
            config: {
              path: ["sections", "gallery", "images"],
              array_contains: [raw],
            },
          },
        },
      },
    ],
  };
  const activity = await prisma.business.findFirst({
    where: {
      AND: [
        reference,
        {
          OR: [
            ...(userId ? [{ userId }] : []),
            { isActive: true, moderationStatus: "APPROVED" },
          ],
        },
      ],
    },
    select: { id: true },
  });
  if (!activity) return null;
  return getSignedImageUrl(url.href);
}
