const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('\n=== VÉRIFICATION DES UTILISATEURS ===\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        _count: {
          select: {
            businesses: true,
            sessions: true
          }
        }
      }
    })

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données!')
      return
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   👤 Nom: ${user.name || 'N/A'}`)
      console.log(`   🔐 Rôle: ${user.role}`)
      console.log(`   💼 Entreprises: ${user._count.businesses}`)
      console.log(`   🔑 Sessions actives: ${user._count.sessions}`)
      console.log('')
    })

    // Vérifier les sessions actives
    console.log('=== SESSIONS ACTIVES ===\n')
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        expires: 'desc'
      }
    })

    if (sessions.length === 0) {
      console.log('❌ Aucune session active')
    } else {
      sessions.forEach((session, index) => {
        const isExpired = new Date(session.expires) < new Date()
        console.log(`${index + 1}. Session ID: ${session.id}`)
        console.log(`   Utilisateur: ${session.user.email}`)
        console.log(`   User ID: ${session.userId}`)
        console.log(`   Expire: ${session.expires}`)
        console.log(`   Status: ${isExpired ? '❌ EXPIRÉ' : '✅ ACTIF'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

