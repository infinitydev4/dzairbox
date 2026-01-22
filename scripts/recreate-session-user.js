const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function recreateUser() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const user = await prisma.user.create({
      data: {
        id: 'cmjnaergu00000s1kaqprtoeg',
        email: 'test-old@test.com',
        name: 'Test User Old',
        password: hashedPassword,
        role: 'USER',
      }
    })

    console.log('✅ Utilisateur recréé avec succès!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Mot de passe: test123')
    console.log('🆔 ID:', user.id)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recreateUser()

