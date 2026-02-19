import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import dns from 'node:dns'

// Force la résolution DNS à privilégier l'IPv4 pour éviter ENETUNREACH (IPv6 non supporté sur certains réseaux)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

dotenv.config({ path: '.env.local' })

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!dbUrl) {
  console.error("❌ Erreur : SUPABASE_DB_URL ou DATABASE_URL n'est pas définie.")
  console.log("Usage : SUPABASE_DB_URL='...' npm run db:apply")
  process.exit(1)
}

// Configuration pour forcer la connexion et gérer le SSL
const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 20,
})

async function runMigrations() {
  const migrationsDir = './supabase/migrations'
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Erreur : Le dossier ${migrationsDir} n'existe pas.`)
    process.exit(1)
  }

  const files = fs.readdirSync(migrationsDir).sort()

  console.log('🚀 Début des migrations...')

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`📑 Exécution de : ${file}`)
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      try {
        await sql.unsafe(content)
        console.log(`✅ ${file} terminé.`)
      } catch (err) {
        console.error(`❌ Erreur dans ${file} :`, err.message)
      }
    }
  }

  console.log('✨ Toutes les migrations sont terminées.')
  await sql.end() // Fermer la connexion proprement
  process.exit(0)
}

runMigrations()
