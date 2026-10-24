import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveLegacyImage } from "@/lib/studio/media-access";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const source = await resolveLegacyImage(
      request.nextUrl.searchParams.get("url"),
      session?.user.id,
    );
    if (!source) return new NextResponse(null, { status: 404 });
    if (source.startsWith("/api/media/"))
      return NextResponse.redirect(new URL(source, request.url));
    const response = await fetch(source, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return new NextResponse(null, { status: 502 });
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
