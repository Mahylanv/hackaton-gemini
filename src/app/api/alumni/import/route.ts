import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { syncAlumniData } from '@/lib/alumni-sync-utils'

export async function POST(req: Request) {
  const body = await req.json();
  
  // LOG DE DEBUG DANS LE TERMINAL
  if (body.type === 'DEBUG') {
    console.log(`\x1b[36m[BROWSER-DEBUG]\x1b[0m ${body.message}`);
    return NextResponse.json({ ok: true }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  console.log(`\x1b[32m[API]\x1b[0m Requête d'import reçue (${body.data?.length || 0} profils)`);

  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("\x1b[31m[API] ERREUR: Clé API invalide\x1b[0m");
    return NextResponse.json({ error: 'Non autorisé' }, { 
      status: 401,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const result = await syncAlumniData(supabase, body.data)
    console.log(`\x1b[32m[API] Succès:\x1b[0m ${result.successCount} synchronisés.`);

    return NextResponse.json({ 
      success: true, 
      count: result.successCount,
      errors: result.errorCount 
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err: any) {
    console.error(`\x1b[31m[API] ERREUR:\x1b[0m ${err.message}`);
    return NextResponse.json({ error: err.message }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}
