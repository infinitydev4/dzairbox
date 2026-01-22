const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const userId = 'cmjnaergu00000s1kaqprtoeg'
    
    console.log(`\n🔍 Recherche de l'utilisateur avec ID: ${userId}\n`)
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user) {
      console.log('✅ Utilisateur trouvé:')
      console.log('   Email:', user.email)
      console.log('   Nom:', user.name)
      console.log('   Rôle:', user.role)
    } else {
      console.log('❌ Utilisateur NON trouvé!')
      console.log('\n🔧 Solution: Déconnectez-vous et reconnectez-vous pour obtenir un nouveau token avec un ID valide.')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()

