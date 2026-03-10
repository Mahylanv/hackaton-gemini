'use server'

import { createClient } from '@supabase/supabase-js'
import { syncAlumniData, fetchAlumniFromLinkedIn } from '@/lib/alumni-sync-utils'
import { revalidatePath } from 'next/cache'

/**
 * Action déclenchée par le bouton pour scrapper et synchroniser en direct.
 */
export async function syncAlumni() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: 'Configuration manquante (Clés Supabase dans .env.local)' };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ÉTAPE 1: Scraping automatique (Live)
    const data = await fetchAlumniFromLinkedIn();

    // ÉTAPE 2: Enregistrement en BDD
    const result = await syncAlumniData(supabase, data);

    // ÉTAPE 3: Mise à jour de l'affichage
    revalidatePath('/alumni');

    return { 
      success: true, 
      message: `${result.successCount} alumni synchronisés en direct (${result.errorCount} erreurs).`,
      logs: result.logs
    };
  } catch (err: any) {
    return { error: `Échec du scraping en direct: ${err.message}` };
  }
}
