import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { moderateBusiness,StudioError } from "@/lib/studio/server"
const schema=z.object({action:z.enum(["approve","reject","changes","suspend"]).optional(),isActive:z.boolean().optional(),reason:z.string().max(2000).default("")})
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getServerSession(authOptions);if(session?.user.role!=="ADMIN"||!session.user.emailVerified)return NextResponse.json({code:"FORBIDDEN"},{status:403})
 try{const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({code:"INVALID_DATA"},{status:400});const action=body.data.action||(body.data.isActive===true?"approve":body.data.isActive===false?"suspend":null);if(!action)return NextResponse.json({code:"INVALID_DATA"},{status:400});await moderateBusiness((await params).id,action,body.data.reason);return NextResponse.json({success:true})}catch(e){if(e instanceof StudioError)return NextResponse.json({code:e.code},{status:e.status});return NextResponse.json({code:"SERVER_ERROR"},{status:500})}
}
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){const session=await getServerSession(authOptions);if(session?.user.role!=="ADMIN"||!session.user.emailVerified)return NextResponse.json({code:"FORBIDDEN"},{status:403});await prisma.business.delete({where:{id:(await params).id}});return NextResponse.json({success:true})}
