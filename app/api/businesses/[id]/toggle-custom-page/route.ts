import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getServerSession(authOptions);if(!session?.user.id)return NextResponse.json({code:"UNAUTHORIZED"},{status:401});const business=await prisma.business.findFirst({where:{id:(await params).id,userId:session.user.id}});if(!business)return NextResponse.json({code:"NOT_FOUND"},{status:404});const body=await req.json();if(body.enabled!==false)return NextResponse.json({code:"STUDIO_REQUIRED"},{status:409});await prisma.business.update({where:{id:business.id},data:{useCustomPage:false}});revalidatePath(`/${business.subdomain}`);return NextResponse.json({enabled:false})
}
