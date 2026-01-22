const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixHoursFormat() {
  console.log('🔧 Correction du format des horaires...\n')

  try {
    // Récupérer toutes les entreprises
    const businesses = await prisma.business.findMany()
    
    console.log(`📊 ${businesses.length} entreprise(s) trouvée(s)\n`)

    let fixedCount = 0
    let alreadyCorrectCount = 0
    let emptyCount = 0

    for (const business of businesses) {
      if (!business.hours) {
        emptyCount++
        continue
      }

      // Vérifier si c'est déjà au bon format (JSON valide)
      try {
        const parsed = JSON.parse(business.hours)
        if (typeof parsed === 'object' && parsed !== null) {
          alreadyCorrectCount++
          console.log(`✅ ${business.name}: Déjà au bon format`)
          continue
        }
      } catch (e) {
        // Pas du JSON valide, on va le corriger
      }

      // Si les horaires contiennent "[object Object]", on les réinitialise
      if (business.hours.includes('[object Object]')) {
        console.log(`🔄 ${business.name}: Format incorrect détecté, réinitialisation...`)
        
        // Créer des horaires par défaut (fermé partout)
        const defaultHours = {
          dimanche: { open: '', close: '', closed: true },
          lundi: { open: '09:00', close: '18:00', closed: false },
          mardi: { open: '09:00', close: '18:00', closed: false },
          mercredi: { open: '09:00', close: '18:00', closed: false },
          jeudi: { open: '09:00', close: '18:00', closed: false },
          vendredi: { open: '', close: '', closed: true },
          samedi: { open: '09:00', close: '18:00', closed: false }
        }

        await prisma.business.update({
          where: { id: business.id },
          data: {
            hours: JSON.stringify(defaultHours)
          }
        })

        fixedCount++
        console.log(`   ✅ Corrigé avec horaires par défaut (Lun-Jeu, Sam: 09:00-18:00)`)
      }
    }

    console.log('\n📈 Résumé:')
    console.log(`   ✅ Déjà correct: ${alreadyCorrectCount}`)
    console.log(`   🔄 Corrigées: ${fixedCount}`)
    console.log(`   ⚪ Vides: ${emptyCount}`)
    console.log(`   📊 Total: ${businesses.length}`)
    
    console.log('\n✨ Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHoursFormat()

