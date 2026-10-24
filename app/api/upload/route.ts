import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    const data = await request.formData();
    const file = data.get("file");
    const businessId = data.get("businessId");
    if (!(file instanceof File) || typeof businessId !== "string")
      return NextResponse.json({ code: "INVALID_FILE" }, { status: 400 });
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json({ code: "INVALID_FILE" }, { status: 400 });
    if (
      !(await prisma.business.findFirst({
        where: { id: businessId, userId: session.user.id },
        select: { id: true },
      }))
    )
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const info = await sharp(buffer, { limitInputPixels: 40_000_000 })
      .metadata()
      .catch(() => null);
    if (!["jpeg", "png", "webp"].includes(info?.format || ""))
      return NextResponse.json({ code: "INVALID_FILE" }, { status: 400 });
    // Re-encoding strips metadata, including location data embedded by cameras.
    const optimized = await sharp(buffer)
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const storageUrl = await uploadImageToS3(
      new File([new Uint8Array(optimized)], "business.webp", {
        type: "image/webp",
      }),
    );
    const media = await prisma.businessMedia.create({
      data: {
        businessId,
        userId: session.user.id,
        storageUrl,
        contentType: "image/webp",
      },
    });
    return NextResponse.json(
      { id: media.id, url: `/api/media/${media.id}` },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Media upload failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ code: "UPLOAD_FAILED" }, { status: 500 });
  }
}
