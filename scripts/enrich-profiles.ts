import { createClient } from '@supabase/supabase-js';
import { ApifyClient } from 'apify-client';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

// --- CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apifyToken = process.env.APIFY_API_TOKEN;

if (!apifyToken) {
  console.error('\x1b[31m[ERREUR] APIFY_API_TOKEN manquant dans le fichier .env\x1b[0m');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const client = new ApifyClient({ token: apifyToken });

async function enrichProfiles() {
  console.log(`\n\x1b[44m\x1b[37m MISSION : ENRICHISSEMENT VIA VLAD88 (COMMUNAUTÉ) \x1b[0m\n`);

  // 1. Récupérer les profils à enrichir
  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    .or('current_company.is.null,current_job_title.is.null');

  if (error) {
    console.error('\x1b[31m[ERREUR BDD]\x1b[0m', error.message);
    return;
  }

  if (!alumni || alumni.length === 0) {
    console.log('\x1b[33m[INFO] Tous les profils sont déjà à jour.\x1b[0m');
    return;
  }

  const urls = alumni.map(a => a.linkedin_url).filter(Boolean);
  
  // On utilise l'acteur de Vlad88, souvent plus compatible avec les petits comptes
  const ACTOR_ID = 'vlad88/linkedin-profile-scraper';
  console.log(`\x1b[32m[OK] ${urls.length} URLs envoyées à ${ACTOR_ID}...\x1b[0m`);

  try {
    const run = await client.actor(ACTOR_ID).call({
      urls: urls,
      // On ne précise PAS de proxy résidentiel pour éviter l'erreur 400 sur compte gratuit
      proxyConfiguration: {
        useApifyProxy: true
      }
    });

    console.log(`\x1b[34m[STATUS] Run ID: ${run.id} terminé. Récupération des résultats...\x1b[0m`);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`\x1b[32m[DATASET] ${items.length} profils récupérés.\x1b[0m`);

    for (const item of items) {
      const profile = item as any;
      const linkedinUrl = profile.url || profile.linkedinUrl;
      if (!linkedinUrl) continue;

      const person = alumni.find(a => 
        a.linkedin_url?.replace(/\/$/, '').toLowerCase() === linkedinUrl.replace(/\/$/, '').toLowerCase()
      );

      if (!person) continue;

      console.log(`\n\x1b[35m>>> ENRICHISSEMENT : ${person.first_name} ${person.last_name} <<<\x1b[0m`);

      // MAPPING (Format Vlad88)
      const jobTitle = profile.headline || profile.title || null;
      const companyName = profile.companyName || profile.company || null;
      const avatarUrl = profile.profilePicture || profile.profilePic || null;

      console.log(`  \x1b[34m[POSTE] ${jobTitle}\x1b[0m`);
      console.log(`  \x1b[34m[BOÎTE] ${companyName}\x1b[0m`);

      await supabase.from('alumni').update({
        avatar_url: avatarUrl || person.avatar_url,
        current_job_title: jobTitle?.trim() || null,
        current_company: companyName?.trim() || null,
        updated_at: new Date().toISOString()
      }).eq('id', person.id);
      
      console.log(`  \x1b[32m[OK] Mis à jour dans Supabase.\x1b[0m`);
    }

  } catch (err: any) {
    console.error(`\x1b[31m[ERREUR APIFY] ${err.message}\x1b[0m`);
    console.log(`\n\x1b[33m[CONSEIL] Si l'enrichissement échoue encore (Erreur 400), c'est que LinkedIn bloque ton compte gratuit.\x1b[0m`);
    console.log(`\x1b[33m[SOLUTION] Tu devras passer sur un plan Apify 'Starter' ou utiliser une API comme Proxycurl (payante).\x1b[0m`);
  }

  console.log(`\n\x1b[44m MISSION TERMINÉE \x1b[0m`);
}

enrichProfiles().catch(console.error);
