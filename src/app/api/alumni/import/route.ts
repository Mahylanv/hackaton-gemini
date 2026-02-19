
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { syncAlumniData } from '@/lib/alumni-sync-utils'

/**
 * API permettant à une extension Chrome d'envoyer des données d'alumni.
 */
export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key')
  
  // Sécurité simple pour éviter que n'importe qui écrive dans votre base
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { data } = await req.json()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const result = await syncAlumniData(supabase, data)

    return NextResponse.json({ 
      success: true, 
      count: result.successCount,
      errors: result.errorCount 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
