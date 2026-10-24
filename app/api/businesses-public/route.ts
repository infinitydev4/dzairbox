import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { publicBusiness } from "@/lib/studio/server"
export const dynamic="force-dynamic"
export async function GET(){const businesses=await prisma.business.findMany({where:{isActive:true,moderationStatus:"APPROVED"},orderBy:{name:"asc"},take:500});return NextResponse.json(businesses.map(publicBusiness))}
