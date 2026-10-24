import type { MetadataRoute } from "next"
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/dashboard/","/admin/","/api/businesses/","/api/auth/","/api/admin/","/api/events","/auth/","/onboarding","/create-service","/register/"]},sitemap:`${process.env.NEXT_PUBLIC_BASE_URL||"https://dzairbox.com"}/sitemap.xml`}}
