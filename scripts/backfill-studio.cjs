// Additive search backfill. No page, slug, location or publication is changed.
require('tsx/cjs')
require('@next/env').loadEnvConfig(process.cwd())
const { PrismaClient }=require('@prisma/client')
const { normalizeSearchText }=require('../lib/search-normalization.ts')
const fr=require('../locales/fr.json'),ar=require('../locales/ar.json')
;(async()=>{const db=new PrismaClient();try{const rows=await db.business.findMany({select:{id:true,name:true,category:true,address:true,description:true,services:true}});for(const b of rows)await db.business.update({where:{id:b.id},data:{searchText:normalizeSearchText([b.name,b.category,fr.categories[b.category],ar.categories[b.category],b.address,b.description,b.services].filter(Boolean).join(' '))}});console.log(`${rows.length} index de recherche actualisés ; adresses et pages conservées.`)}finally{await db.$disconnect()}})().catch(e=>{console.error(e.message);process.exitCode=1})
