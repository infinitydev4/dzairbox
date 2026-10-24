import { NextResponse } from "next/server";
import { allWilayas, allCommunes, locationVersion } from "@/lib/locations";
export function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("wilaya");
  return NextResponse.json(
    {
      version: locationVersion,
      wilayas: allWilayas,
      communes: code ? allCommunes.filter((c) => c.wilayaCode === code) : [],
    },
    { headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
