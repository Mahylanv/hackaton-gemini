import { createClient } from '@supabase/supabase-js';
import { ApifyClient } from 'apify-client';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

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
  console.log(`\n\x1b[44m\x1b[37m MISSION : ENRICHISSEMENT PROFESSIONNEL ALLUMNI \x1b[0m\n`);

  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    .or('current_company.is.null,current_job_title.is.null,avatar_url.is.null');

  if (error || !alumni || alumni.length === 0) {
    console.log('\x1b[33m[INFO] Rien à enrichir.\x1b[0m');
    return;
  }

  const ACTOR_ID = 'apify/google-search-scraper';

  for (const person of alumni) {
    if (!person.linkedin_url) continue;
    
    console.log(`\x1b[34m[SCAN] Recherche ciblée pour : ${person.first_name} ${person.last_name}\x1b[0m`);

    try {
      const run = await client.actor(ACTOR_ID).call({
        queries: person.linkedin_url,
        maxPagesPerQuery: 1,
        resultsPerPage: 1,
        mobileResults: false,
        proxyConfiguration: { useApifyProxy: true }
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0 && items[0].organicResults) {
        const result = items[0].organicResults[0];
        
        if (result && result.url.includes('linkedin.com/in/')) {
          const title = result.title;
          const snippet = result.description || "";

          // 1. EXTRACTION PHOTO (Tentative via Rich Snippets et metadonnées)
          let avatarUrl = person.avatar_url;
          if (result.richSnippet?.cse_image?.length > 0) {
            avatarUrl = result.richSnippet.cse_image[0].src;
          } else if (result.richSnippet?.metatags?.['og:image']) {
            avatarUrl = result.richSnippet.metatags['og:image'];
          }

          // 2. ANALYSE PROFESSIONNELLE (Éviter la confusion Études / Entreprise)
          const cleanTitle = title.split(' | ')[0];
          const parts = cleanTitle.split(' - ');
          
          let jobTitle = person.current_job_title;
          let companyName = person.current_company;

          // Mots-clés d'éducation à ignorer pour l'entreprise
          const eduKeywords = ['mydigitalschool', 'etudiant', 'student', 'alternant', 'intern', 'stagiaire', 'ecole', 'school'];

          if (parts.length >= 3) {
            // [Nom] - [Poste] - [Entreprise]
            const candidateJob = parts[1].trim();
            const candidateCompany = parts[2].trim();

            // Si l'entreprise détectée est MyDigitalSchool, on regarde si on peut trouver mieux dans le snippet
            if (eduKeywords.some(kw => candidateCompany.toLowerCase().includes(kw))) {
              if (snippet.toLowerCase().includes(' chez ')) {
                const afterChez = snippet.split(/ chez /i)[1]?.split(/[. ]/)[0]?.trim();
                if (afterChez && !eduKeywords.some(kw => afterChez.toLowerCase().includes(kw))) {
                  companyName = afterChez;
                  jobTitle = candidateJob;
                }
              }
            } else {
              jobTitle = candidateJob;
              companyName = candidateCompany;
            }
          } else if (parts.length === 2) {
            const candidate = parts[1].trim();
            if (snippet.toLowerCase().includes(' chez ')) {
              companyName = snippet.split(/ chez /i)[1]?.split(/[. ]/)[0]?.trim();
              jobTitle = candidate;
            } else {
              jobTitle = candidate;
              companyName = "MDS Allumni";
            }
          }

          // 3. NETTOYAGE FINAL
          if (!companyName || companyName.toLowerCase().includes('linkedin')) {
            companyName = "MDS Allumni";
          }

          await supabase.from('alumni').update({
            current_job_title: jobTitle || "Allumni",
            current_company: companyName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          }).eq('id', person.id);

          console.log(`  \x1b[32m[SUCCÈS] ${jobTitle} @ ${companyName}\x1b[0m`);
        }
      }
    } catch (err: any) {
      console.error(`  \x1b[31m[ERREUR] ${err.message}\x1b[0m`);
    }
  }
  console.log(`\n\x1b[44m MISSION TERMINÉE \x1b[0m`);
}

enrichProfiles().catch(console.error);
