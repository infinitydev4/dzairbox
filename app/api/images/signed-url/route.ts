import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveLegacyImage } from "@/lib/studio/media-access";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { imageUrl } = await request.json();
    const signedUrl = await resolveLegacyImage(imageUrl, session.user.id);
    return signedUrl
      ? NextResponse.json({ signedUrl })
      : NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  } catch {
    return NextResponse.json({ code: "IMAGE_UNAVAILABLE" }, { status: 400 });
  }
}
