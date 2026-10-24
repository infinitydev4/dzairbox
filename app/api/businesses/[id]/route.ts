import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
export const dynamic="force-dynamic"
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){const session=await getServerSession(authOptions);if(!session?.user.id)return NextResponse.json({code:"UNAUTHORIZED"},{status:401});const b=await prisma.business.findFirst({where:{id:(await params).id,userId:session.user.id}});if(!b)return NextResponse.json({code:"NOT_FOUND"},{status:404});return NextResponse.json(b)}
export async function PUT(){return NextResponse.json({code:"STUDIO_REQUIRED",error:"Utilisez le studio pour conserver le brouillon et la version publique."},{status:409})}
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){const session=await getServerSession(authOptions);if(!session?.user.id)return NextResponse.json({code:"UNAUTHORIZED"},{status:401});const b=await prisma.business.findFirst({where:{id:(await params).id,userId:session.user.id}});if(!b)return NextResponse.json({code:"NOT_FOUND"},{status:404});await prisma.business.delete({where:{id:b.id}});revalidatePath(`/${b.subdomain}`);return NextResponse.json({success:true})}
