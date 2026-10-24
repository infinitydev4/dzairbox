import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import type { PrismaClient as PrismaClientType } from "@prisma/client"

const envPath = path.join(process.cwd(), ".env")

// Prisma relit .env à chaque chargement du client et affiche « Schema Env Error »
// puis continue. Si le fichier est dataless, une seule erreur explicite suffit.
function assertEnvFileReadable() {
  try {
    const fd = fs.openSync(envPath, "r")
    fs.closeSync(fd)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === "ENOENT") return
    if (code === "ETIMEDOUT") {
      throw new Error(
        ".env est présent mais illisible (ETIMEDOUT). Le fichier est dataless : sa taille est annoncée, ses données ne sont pas sur le disque. Restaurez-le depuis une sauvegarde ou la prod, puis redémarrez le serveur."
      )
    }
    throw error
  }
}

assertEnvFileReadable()

const require = createRequire(import.meta.url)
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client")

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
