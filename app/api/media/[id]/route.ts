import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedImageUrl } from "@/lib/s3";
import { studioDocumentSchema } from "@/lib/studio/document";
export const dynamic = "force-dynamic";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const media = await prisma.businessMedia.findUnique({
    where: { id: (await params).id },
    include: {
      business: { include: { pageConfig: { select: { config: true } } } },
    },
  });
  if (!media) return new NextResponse(null, { status: 404 });
  const session = await getServerSession(authOptions);
  const owner = session?.user?.id === media.userId;
  const parsed = studioDocumentSchema.safeParse(
    media.business.pageConfig?.config,
  );
  let publicImage = false;
  if (
    media.business.isActive &&
    media.business.moderationStatus === "APPROVED" &&
    media.business.useCustomPage &&
    parsed.success
  ) {
    const c = parsed.data.content;
    publicImage = [
      c.logo,
      c.cover,
      ...c.gallery.map((g) => g.url),
      ...c.services.map((s) => s.image),
    ].includes(`/api/media/${media.id}`);
  }
  if (!owner && !publicImage) return new NextResponse(null, { status: 404 });
  try {
    const source = await fetch(await getSignedImageUrl(media.storageUrl));
    if (!source.ok) return new NextResponse(null, { status: 502 });
    return new NextResponse(source.body, {
      headers: {
        "Content-Type": media.contentType,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
