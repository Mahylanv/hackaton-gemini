import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { loadEnvConfig } from '@next/env';
import * as path from 'path';

// Charger les variables d'environnement
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Identifiants fournis par l'utilisateur
const LINKEDIN_EMAIL = "rm1.marcelli@gmail.com";
const LINKEDIN_PASSWORD = "Romain31";

/**
 * Nettoie et dédoublonne une liste de diplômes tout en gardant les noms complets.
 */
function deduplicateDegrees(degrees: string[]): string {
  if (degrees.length === 0) return "Parcours non trouvé";
  
  // Supprimer les doublons exacts et nettoyer
  const unique = Array.from(new Set(degrees.map(d => d.trim()))).filter(d => d.length > 0);
  
  if (unique.length === 0) return "Parcours non trouvé";
  
  // On garde tout mais on sépare proprement
  return unique.join(' / ');
}

async function enrichProfiles() {
  console.log(`\x1b[34m[INFO] ${new Date().toISOString()} - Lancement du robot d'enrichissement (Mode Automatique)...\x1b[0m`);

  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    .or('degree.eq.Importé via Excel,degree.is.null,degree.eq.Parcours non trouvé');

  if (error) {
    console.error(`\x1b[31m[ERREUR] Supabase: ${error.message}\x1b[0m`);
    return;
  }

  if (!alumni || alumni.length === 0) {
    console.log('\x1b[33m[INFO] Aucun profil à enrichir.\x1b[0m');
    return;
  }

  // Lancement du navigateur
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // --- CONNEXION AUTOMATIQUE ---
    console.log(`\x1b[34m[INFO] Tentative de connexion automatique à LinkedIn...\x1b[0m`);
    await page.goto('https://www.linkedin.com/login');
    
    await page.fill('#username', LINKEDIN_EMAIL);
    await page.fill('#password', LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Vérification de sécurité (Code email ?)
    try {
      await page.waitForURL(/.*linkedin\.com\/checkpoint\/challenge.*/, { timeout: 5000 });
      console.log(`\x1b[33m[ATTENTION] LinkedIn demande une vérification (MFA). Veuillez entrer le code manuellement dans le navigateur.\x1b[0m`);
    } catch (e) {
      // Pas de challenge détecté, on continue
    }

    // Attendre d'être sur le feed ou d'avoir la barre de recherche
    await Promise.any([
      page.waitForSelector('.search-global-typeahead__input', { timeout: 300000 }),
      page.waitForURL(/.*linkedin\.com\/feed.*/, { timeout: 300000 })
    ]);
    
    console.log(`\x1b[32m[SUCCÈS] Robot connecté et prêt !\x1b[0m`);

    for (const person of alumni) {
      console.log(`\n\x1b[36m[SCAN] ${person.first_name} ${person.last_name}...\x1b[0m`);
      
      try {
        await page.goto(person.linkedin_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);

        // EXTRACTION PHOTO
        const avatarUrl = await page.getAttribute(
          '.pv-top-card-profile-picture__image--show, .pv-top-card__photo img, [data-test-icon="profile-picture"] img', 
          'src'
        ).catch(() => null);

        // SCAN FORMATION
        await page.evaluate(() => window.scrollBy(0, 1500));
        await page.waitForTimeout(2000);

        const educationItems = await page.locator('.display-flex.flex-row.justify-space-between').all();
        let allDegrees: string[] = [];
        let minEntryYear: number | null = null;
        let maxGradYear: number | null = null;

        for (const item of educationItems) {
          const schoolName = await item.locator('.hoverable-link-text.t-bold span[aria-hidden="true"]').first().innerText().catch(() => "");
          
          if (schoolName.toLowerCase().includes('mydigitalschool')) {
            const degree = await item.locator('.t-14.t-normal span[aria-hidden="true"]').first().innerText().catch(() => "");
            const yearsRaw = await item.locator('.t-14.t-normal.t-black--light .pvs-entity__caption-wrapper').first().innerText().catch(() => "");
            
            // On ignore les textes parasites (abonnés, etc.)
            if (degree && !degree.match(/\d/) && !degree.toLowerCase().includes('abonné') && !degree.toLowerCase().includes('follower')) {
              allDegrees.push(degree.trim());
            }

            const years = yearsRaw.match(/\d{4}/g);
            if (years) {
              const start = parseInt(years[0]);
              const end = years.length > 1 ? parseInt(years[1]) : start;
              if (minEntryYear === null || start < minEntryYear) minEntryYear = start;
              if (maxGradYear === null || end > maxGradYear) maxGradYear = end;
            }
          }
        }

        const finalDegree = deduplicateDegrees(allDegrees);

        const finalData = {
          avatar_url: avatarUrl,
          degree: finalDegree,
          entry_year: minEntryYear,
          grad_year: maxGradYear,
          updated_at: new Date().toISOString()
        };

        await supabase.from('alumni').update(finalData).eq('id', person.id);
        console.log(`  \x1b[32m[BDD] ${finalDegree} | Photo: ${avatarUrl ? 'OK' : 'KO'}\x1b[0m`);

      } catch (err: any) {
        console.error(`  \x1b[31m[ERREUR] ${err.message}\x1b[0m`);
      }
      
      await page.waitForTimeout(4000 + Math.random() * 3000);
    }

  } finally {
    console.log(`\n\x1b[32m>>> MISSION TERMINÉE <<<\x1b[0m`);
    await browser.close();
  }
}

enrichProfiles().catch(console.error);
