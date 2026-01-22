const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    })

    if (existingUser) {
      console.log('✅ L\'utilisateur test@test.com existe déjà avec l\'ID:', existingUser.id)
      return
    }

    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash('test123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
        phone: '+213 555 000 000',
        city: 'Alger',
      }
    })

    console.log('✅ Utilisateur test créé avec succès!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Mot de passe: test123')
    console.log('🆔 ID:', user.id)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()


