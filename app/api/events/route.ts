import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
const recent = new Map<string, number>();
const allowed = new Set([
  "view",
  "call",
  "whatsapp",
  "email",
  "directions",
  "social",
  "studio_open",
  "publication_request",
  "signup_start",
  "signup_account",
  "signup_activity",
  "signup_contact",
  "signup_abandon",
]);
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin)
      return new NextResponse(null, { status: 403 });
    const text = await req.text();
    if (text.length > 1000) return new NextResponse(null, { status: 400 });
    const body = JSON.parse(text);
    if (!allowed.has(body.kind)) return new NextResponse(null, { status: 400 });
    const businessId =
      typeof body.businessId === "string" ? body.businessId : null;
    if (businessId) {
      const internal = ["studio_open", "publication_request"].includes(
        body.kind,
      );
      if (internal) {
        const session = await getServerSession(authOptions);
        if (
          !session?.user.id ||
          !(await prisma.business.findFirst({
            where: { id: businessId, userId: session.user.id },
            select: { id: true },
          }))
        )
          return new NextResponse(null, { status: 404 });
      } else if (
        !(await prisma.business.findFirst({
          where: {
            id: businessId,
            isActive: true,
            moderationStatus: "APPROVED",
          },
          select: { id: true },
        }))
      )
        return new NextResponse(null, { status: 404 });
    } else if (!body.kind.startsWith("signup_"))
      return new NextResponse(null, { status: 400 });
    const visitor =
      req.cookies.get("dzairbox_metrics")?.value || crypto.randomUUID();
    const key = `${visitor}:${businessId || "funnel"}:${body.kind}`;
    const now = Date.now();
    const ttl = body.kind === "view" ? 900000 : 2000;
    if (now - (recent.get(key) || 0) < ttl)
      return new NextResponse(null, { status: 204 });
    recent.set(key, now);
    if (recent.size > 10000)
      for (const [k, v] of recent) if (now - v > 900000) recent.delete(k);
    const day = new Date(new Date().toISOString().slice(0, 10));
    if (businessId)
      await prisma.businessEvent.upsert({
        where: { businessId_kind_day: { businessId, kind: body.kind, day } },
        create: { businessId, kind: body.kind, day, count: 1 },
        update: { count: { increment: 1 } },
      });
    else
      await prisma.businessEvent.create({
        data: { kind: body.kind, day, count: 1 },
      });
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set("dzairbox_metrics", visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
