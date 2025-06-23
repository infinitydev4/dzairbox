// Script pour tester les variables d'environnement AWS
require('dotenv').config()

console.log('🔍 Test des variables d\'environnement AWS...\n')

const requiredVars = [
  'DZAIRBOX_AWS_REGION',
  'DZAIRBOX_AWS_ACCESS_KEY_ID', 
  'DZAIRBOX_AWS_SECRET_ACCESS_KEY',
  'DZAIRBOX_AWS_S3_BUCKET_NAME'
]

let allGood = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***masqué***' : value}`)
  } else {
    console.log(`❌ ${varName}: NON DÉFINIE`)
    allGood = false
  }
})

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('🎉 Toutes les variables d\'environnement AWS sont configurées !')
} else {
  console.log('⚠️  Certaines variables d\'environnement AWS sont manquantes.')
  console.log('Vérifiez votre fichier .env')
}

console.log('\n📝 Format attendu dans .env:')
console.log('DZAIRBOX_AWS_REGION=us-east-1')
console.log('DZAIRBOX_AWS_ACCESS_KEY_ID=AKIA...')
console.log('DZAIRBOX_AWS_SECRET_ACCESS_KEY=...')
console.log('DZAIRBOX_AWS_S3_BUCKET_NAME=nom-de-votre-bucket') 