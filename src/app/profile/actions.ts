'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const linkedinUrl = formData.get('linkedinUrl') as string
  const gradYear = parseInt(formData.get('gradYear') as string)
  const degree = formData.get('degree') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      linkedin_url: linkedinUrl,
      grad_year: gradYear,
      degree: degree,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    redirect('/profile?error=' + error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/')
  redirect('/')
}
