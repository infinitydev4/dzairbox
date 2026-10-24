import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
export const dynamic="force-dynamic"
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=(process.env.NEXT_PUBLIC_BASE_URL||"https://dzairbox.com").replace(/\/$/,"");const businesses=await prisma.business.findMany({where:{isActive:true,moderationStatus:"APPROVED"},select:{subdomain:true,updatedAt:true}});return[{url:base,changeFrequency:"weekly",priority:1},{url:`${base}/businesses`,changeFrequency:"daily",priority:.9},...businesses.map(b=>({url:`${base}/${b.subdomain}`,lastModified:b.updatedAt,changeFrequency:"weekly" as const,priority:.7}))]}
