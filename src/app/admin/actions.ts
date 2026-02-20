'use server'

import { createClient } from '@/utils/supabase/server'
import { generateLinkedInUrl } from '@/lib/alumni-sync-utils'
import * as XLSX from 'xlsx'
import { revalidatePath } from 'next/cache'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

export async function importExcelData(formData: FormData) {
  const supabase = await createClient()
  
  // Vérification du rôle Admin/SuperAdmin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    return { error: 'Accès réservé aux administrateurs' }
  }

  const file = formData.get('file') as File
  if (!file) return { error: 'Aucun fichier fourni' }

  try {
    let workbook;
    
    if (file.name.endsWith('.csv')) {
      const text = await file.text()
      workbook = XLSX.read(text, { type: 'string' })
    } else {
      const bytes = await file.arrayBuffer()
      workbook = XLSX.read(bytes, { type: 'array' })
    }
    
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const rawData = XLSX.utils.sheet_to_json(worksheet) as any[]
    
    const alumniToImport = rawData.map(row => {
      const firstName = row.Prenom || row.prenom || row['First Name'] || row.firstname || ''
      const lastName = row.Nom || row.nom || row['Last Name'] || row.lastname || ''
      let linkedinUrl = row.Linkedin || row.linkedin || row['LinkedIn URL'] || ''
      
      if (!firstName || !lastName) return null

      if (!linkedinUrl) {
        linkedinUrl = generateLinkedInUrl(firstName, lastName)
      } else {
        linkedinUrl = linkedinUrl.split('?')[0]
        if (!linkedinUrl.endsWith('/')) linkedinUrl += '/'
      }

      return {
        first_name: firstName,
        last_name: lastName,
        linkedin_url: linkedinUrl,
        degree: 'Importé via Excel',
        updated_at: new Date().toISOString()
      }
    }).filter(Boolean)

    if (alumniToImport.length === 0) {
      return { error: 'Aucune donnée valide trouvée dans le fichier' }
    }

    const { error } = await supabase
      .from('alumni')
      .upsert(alumniToImport, { onConflict: 'linkedin_url' })

    if (error) throw error

    revalidatePath('/alumni')
    return { success: true, count: alumniToImport.length }

  } catch (err: any) {
    return { error: `Erreur : ${err.message}` }
  }
}

/**
 * Lance le script d'enrichissement LinkedIn en arrière-plan.
 */
export async function startEnrichmentScan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    return { error: 'Accès refusé' }
  }

  console.log(`\x1b[35m[SERVER-ACTION]\x1b[0m Lancement du scan d'enrichissement...`);

  try {
    const child = spawn('npx', ['tsx', 'scripts/enrich-profiles.ts'], {
      shell: true,
      stdio: 'inherit'
    });

    child.on('error', (err: any) => {
      console.error(`\x1b[31m[SCAN ERROR]\x1b[0m ${err.message}`);
    });

    return { success: true, message: 'Le scan a été lancé. Une fenêtre LinkedIn va s\'ouvrir.' }
  } catch (err: any) {
    return { error: `Erreur : ${err.message}` }
  }
}

/**
 * Récupère la progression actuelle de l'enrichissement.
 */
export async function getEnrichmentProgress() {
  const supabase = await createClient()
  
  const { count: total } = await supabase
    .from('alumni')
    .select('*', { count: 'exact', head: true })

  const { count: processed } = await supabase
    .from('alumni')
    .select('*', { count: 'exact', head: true })
    .not('degree', 'eq', 'Importé via Excel')
    .not('degree', 'is', null)

  return {
    total: total || 0,
    processed: processed || 0,
    percentage: total ? Math.round((processed! / total) * 100) : 0
  }
}
