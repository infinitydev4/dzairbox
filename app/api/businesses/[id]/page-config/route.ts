import { GET as readStudio } from "../studio/route"
import { NextResponse } from "next/server"
export const GET=readStudio
// Retired editors cannot bypass the studio's revision and moderation checks.
export async function POST(){return NextResponse.json({code:"STUDIO_REQUIRED",error:"Ouvrez le studio pour modifier cette page."},{status:409})}
