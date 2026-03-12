import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { linkedin_url, current_job_title, current_company, avatar_url } = body

    if (!linkedin_url) {
      return NextResponse.json({ error: 'URL LinkedIn manquante' }, { status: 400 })
    }

    console.log(`[API] Enrichissement manuel pour : ${linkedin_url}`)

    const { error } = await supabase
      .from('alumni')
      .update({
        current_job_title,
        current_company,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('linkedin_url', linkedinUrlNormalizer(linkedin_url))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function linkedinUrlNormalizer(url: string) {
  return url.split('?')[0].replace(/\/$/, '') + '/'
}
