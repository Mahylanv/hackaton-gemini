'use server'

import { createClient } from '@/utils/supabase/server'
import { generateLinkedInUrl } from '@/lib/alumni-sync-utils'
import * as XLSX from 'xlsx'
import { revalidatePath } from 'next/cache'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const execPromise = promisify(exec)

const jobSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  company: z.string().min(2, "L'entreprise est requise"),
  description: z.string().min(10, "La description est trop courte"),
  type: z.enum(['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance']),
  location: z.string().min(2, "La localisation est requise"),
  link: z.string().url("Le lien doit être valide"),
})

const eventSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().min(10, "La description est trop courte"),
  date: z.string().min(1, "La date est requise"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  type: z.string().min(2, "Le type est requis"),
  location: z.string().min(2, "La localisation est requise"),
  image_url: z.string().optional(),
})

async function checkRole(allowedRoles: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error('Accès refusé')
  }

  return { supabase, user }
}

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
      const entryYear = parseInt(row.Entree || row.entree || row.entry || '') || null
      const gradYear = parseInt(row.Sortie || row.sortie || row.grad || '') || null
      
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
        entry_year: entryYear,
        grad_year: gradYear,
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

export async function updateRole(userId: string, role: string) {
  const { supabase } = await checkRole(['SUPER_ADMIN'])

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/roles')
}

export async function deleteUser(userId: string) {
  const { supabase } = await checkRole(['SUPER_ADMIN'])

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/roles')
}

export async function deleteAlumnus(alumnusId: string) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const { error } = await supabase
    .from('alumni')
    .delete()
    .eq('id', alumnusId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/alumni')
  revalidatePath('/alumni')
}

export async function updateAlumnus(alumnusId: string, formData: FormData) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const data = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    linkedin_url: formData.get('linkedin_url'),
    grad_year: parseInt(formData.get('grad_year') as string) || null,
    degree: formData.get('degree'),
    current_job_title: formData.get('current_job_title'),
    current_company: formData.get('current_company'),
  }

  const { error } = await supabase
    .from('alumni')
    .update(data)
    .eq('id', alumnusId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/alumni')
  revalidatePath('/alumni')
}

export async function createJob(formData: FormData) {
  const { supabase, user } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const rawData = {
    title: formData.get('title'),
    company: formData.get('company'),
    description: formData.get('description'),
    type: formData.get('type'),
    location: formData.get('location'),
    link: formData.get('link'),
  }

  const validatedData = jobSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.issues[0]?.message || "Erreur de validation")
  }

  const { error } = await supabase
    .from('jobs')
    .insert({
      ...validatedData.data,
      author_id: user.id
    })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  redirect('/admin/jobs')
}

export async function deleteJob(jobId: string) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
}

export async function updateJob(jobId: string, formData: FormData) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const rawData = {
    title: formData.get('title'),
    company: formData.get('company'),
    description: formData.get('description'),
    type: formData.get('type'),
    location: formData.get('location'),
    link: formData.get('link'),
  }

  const validatedData = jobSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.issues[0]?.message || "Erreur de validation")
  }

  const { error } = await supabase
    .from('jobs')
    .update({
      ...validatedData.data,
    })
    .eq('id', jobId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const imageFile = formData.get('image') as File | null
  let imageUrl = null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `event-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, imageFile)

    if (uploadError) throw new Error(`Erreur lors de l'upload de l'image : ${uploadError.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath)
    
    imageUrl = publicUrl
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    type: formData.get('type'),
    location: formData.get('location'),
    image_url: imageUrl,
  }

  const validatedData = eventSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.issues[0]?.message || "Erreur de validation")
  }

  const { error } = await supabase
    .from('events')
    .insert({
      ...validatedData.data,
      author_id: user.id
    })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
  revalidatePath('/events')
  redirect('/admin/events')
}

export async function deleteEvent(eventId: string) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
  revalidatePath('/events')
}

export async function updateEvent(eventId: string, formData: FormData) {
  const { supabase } = await checkRole(['ADMIN', 'SUPER_ADMIN'])

  const imageFile = formData.get('image') as File | null
  let imageUrl = formData.get('image_url') as string | null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `event-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, imageFile)

    if (uploadError) throw new Error(`Erreur lors de l'upload de l'image : ${uploadError.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath)
    
    imageUrl = publicUrl
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    type: formData.get('type'),
    location: formData.get('location'),
    image_url: imageUrl,
  }

  const validatedData = eventSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.issues[0]?.message || "Erreur de validation")
  }

  const { error } = await supabase
    .from('events')
    .update({
      ...validatedData.data,
    })
    .eq('id', eventId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
}

export async function toggleEventInterest(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Vous devez être connecté pour marquer un intérêt.')

  // Vérifier si l'utilisateur s'intéresse déjà à l'événement
  const { data: existingInterest } = await supabase
    .from('event_interests')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existingInterest) {
    // Si l'intérêt existe, on le supprime (désintéressé)
    const { error } = await supabase
      .from('event_interests')
      .delete()
      .eq('id', existingInterest.id)
    if (error) throw new Error(error.message)
  } else {
    // Sinon, on le crée (intéressé)
    const { error } = await supabase
      .from('event_interests')
      .insert({ event_id: eventId, user_id: user.id })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
}
