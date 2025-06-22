const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@dzbusiness.dz"
    const password = process.env.ADMIN_PASSWORD || "Admin123!"
    const name = process.env.ADMIN_NAME || "Administrateur"

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log("Un administrateur avec cet email existe déjà")
      
      // Mettre à jour le rôle si nécessaire
      if (existingAdmin.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" }
        })
        console.log("Rôle mis à jour vers ADMIN")
      }
      
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN"
      }
    })

    console.log("Administrateur créé avec succès !")
    console.log("Email:", email)
    console.log("Mot de passe:", password)
    console.log("ID:", admin.id)
    console.log("")
    console.log("Vous pouvez maintenant vous connecter au dashboard admin :")
    console.log("http://localhost:3000/auth/signin")
    console.log("")
    console.log("⚠️  IMPORTANT: Changez le mot de passe après la première connexion")

  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
if (require.main === module) {
  createAdmin()
}

module.exports = { createAdmin } 