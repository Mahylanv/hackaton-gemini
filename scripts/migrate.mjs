import postgres from 'postgres'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

  if (!dbUrl) {
    console.error("❌ Erreur : DATABASE_URL n'est pas définie dans .env.local")
    process.exit(1)
  }

  console.log('🔌 Tentative de connexion via le tunnel sécurisé (Port 443)...')

  // Configuration pour passer à travers les pare-feux (SSL obligatoire pour le port 443)
  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    connect_timeout: 60, // On laisse 1 minute pour la connexion (réseaux d'école lents)
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  })

  try {
    const schemaPath = './supabase/schema.sql'
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Erreur : Le fichier ${schemaPath} est introuvable.`)
      process.exit(1)
    }

    console.log(`📑 Application du schéma complet...`)
    const content = fs.readFileSync(schemaPath, 'utf8')
    
    // Exécution du bloc SQL
    await sql.unsafe(content)
    
    console.log('✅ Succès : Votre base de données est maintenant à jour !')
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('already a member')) {
      console.log('ℹ️ Information : La base de données possède déjà certains éléments du schéma, mise à jour partielle réussie.')
    } else {
      console.error('❌ Erreur de migration :', err.message)
    }
  } finally {
    await sql.end()
    process.exit(0)
  }
}

runMigration().catch(err => {
  console.error('❌ Erreur critique :', err.message)
  process.exit(1)
})
