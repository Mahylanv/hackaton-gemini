'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { jobSchema } from '@/types/jobs'
import { eventSchema } from '@/types/events'

async function checkRole(requiredRoles: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !requiredRoles.includes(profile.role)) {
    redirect('/')
  }

  return { supabase, user }
}

export async function updateRole(userId: string, newRole: string) {
  const { supabase } = await checkRole(['SUPER_ADMIN'])

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
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
    throw new Error(validatedData.error.errors[0].message)
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
    throw new Error(validatedData.error.errors[0].message)
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

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    type: formData.get('type'),
    location: formData.get('location'),
  }

  const validatedData = eventSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.errors[0].message)
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

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    type: formData.get('type'),
    location: formData.get('location'),
  }

  const validatedData = eventSchema.safeParse(rawData)

  if (!validatedData.success) {
    throw new Error(validatedData.error.errors[0].message)
  }

  const { error } = await supabase
    .from('events')
    .update({
      ...validatedData.data,
    })
    .eq('id', eventId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
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

