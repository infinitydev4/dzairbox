import { NextResponse } from "next/server";
import { searchDirectory } from "@/lib/studio/directory";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    return NextResponse.json(
      await searchDirectory(new URL(req.url).searchParams),
    );
  } catch (error) {
    console.error(
      "Directory request failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { code: "DIRECTORY_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
