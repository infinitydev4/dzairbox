import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { readStudio, saveStudio, StudioError } from "@/lib/studio/server";
export const dynamic = "force-dynamic";
const payload = z.object({
  document: z.unknown(),
  expectedRevision: z.number().int().nonnegative(),
  publish: z.boolean().default(false),
});
function errorResponse(e: unknown) {
  if (e instanceof StudioError)
    return NextResponse.json(
      { code: e.code, details: e.details },
      { status: e.status },
    );
  if (e instanceof SyntaxError)
    return NextResponse.json({ code: "INVALID_DOCUMENT" }, { status: 400 });
  console.error(
    "Studio request failed",
    e instanceof Error ? e.message : "unknown",
  );
  return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
}
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json(
      await readStudio((await context.params).id, session.user.id),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    const body = payload.safeParse(await req.json());
    if (!body.success)
      return NextResponse.json({ code: "INVALID_DOCUMENT" }, { status: 400 });
    return NextResponse.json(
      await saveStudio(
        (await context.params).id,
        session.user.id,
        body.data.document,
        body.data.expectedRevision,
        body.data.publish,
      ),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
