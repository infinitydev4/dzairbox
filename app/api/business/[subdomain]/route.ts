import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { publicBusiness } from "@/lib/studio/server"
export async function GET(_req:Request,{params}:{params:Promise<{subdomain:string}>}){const b=await prisma.business.findFirst({where:{subdomain:(await params).subdomain,isActive:true,moderationStatus:"APPROVED"}});return b?NextResponse.json(publicBusiness(b)):NextResponse.json({code:"NOT_FOUND"},{status:404})}
