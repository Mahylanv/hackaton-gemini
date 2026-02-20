import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { loadEnvConfig } from '@next/env';
import * as path from 'path';

// Charger les variables d'environnement
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LINKEDIN_EMAIL = "rm1.marcelli@gmail.com";
const LINKEDIN_PASSWORD = "Romain31";

function deduplicateDegrees(degrees: string[]): string {
  if (degrees.length === 0) return "Parcours non trouvé";
  const unique = Array.from(new Set(degrees.map(d => d.trim()))).filter(d => d.length > 0);
  return unique.length === 0 ? "Parcours non trouvé" : unique.join(' / ');
}

async function enrichProfiles() {
  console.log(`\x1b[34m[INFO] ${new Date().toISOString()} - Lancement du robot d'enrichissement optimisé...\x1b[0m`);

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

  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`\x1b[34m[INFO] Connexion à LinkedIn...\x1b[0m`);
    await page.goto('https://www.linkedin.com/login');
    
    await page.fill('#username', LINKEDIN_EMAIL);
    await page.fill('#password', LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');

    await Promise.any([
      page.waitForSelector('.search-global-typeahead__input', { timeout: 300000 }),
      page.waitForURL(/.*linkedin\.com\/feed.*/, { timeout: 300000 })
    ]);
    
    console.log(`\x1b[32m[SUCCÈS] Robot prêt !\x1b[0m`);

    for (const person of alumni) {
      console.log(`\n\x1b[36m[SCAN] ${person.first_name} ${person.last_name}...\x1b[0m`);
      
      try {
        await page.goto(person.linkedin_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Attente réduite pour plus de rapidité
        await page.waitForTimeout(2000);

        // --- 1. EXTRACTION PHOTO DE PROFIL ---
        const avatarUrl = await page.getAttribute(
          '.pv-top-card-profile-picture__image--show, .pv-top-card__photo img, [data-test-icon="profile-picture"] img', 
          'src'
        ).catch(() => null);

        // --- 2. EXTRACTION ENTREPRISE ACTUELLE ---
        // On cherche dans le panneau de droite de la top-card ou la première expérience
        let currentCompany = null;
        let companyLogo = null;

        const companyElement = page.locator('button[data-text-details-indicator="control"], .pv-text-details__right-panel-item-link').first();
        if (await companyElement.isVisible()) {
            currentCompany = await companyElement.innerText().catch(() => null);
            companyLogo = await companyElement.locator('img').getAttribute('src').catch(() => null);
        }

        // --- 3. EXTRACTION FORMATIONS ---
        await page.evaluate(() => window.scrollBy(0, 1200));
        await page.waitForTimeout(1500);

        const educationItems = await page.locator('.display-flex.flex-row.justify-space-between').all();
        let allDegrees: string[] = [];
        let minEntryYear: number | null = null;
        let maxGradYear: number | null = null;

        for (const item of educationItems) {
          const schoolName = await item.locator('.hoverable-link-text.t-bold span[aria-hidden="true"]').first().innerText().catch(() => "");
          
          if (schoolName.toLowerCase().includes('mydigitalschool')) {
            const degree = await item.locator('.t-14.t-normal span[aria-hidden="true"]').first().innerText().catch(() => "");
            const yearsRaw = await item.locator('.t-14.t-normal.t-black--light .pvs-entity__caption-wrapper').first().innerText().catch(() => "");
            
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
          current_company: currentCompany?.trim() || null,
          company_logo: companyLogo || null,
          updated_at: new Date().toISOString()
        };

        await supabase.from('alumni').update(finalData).eq('id', person.id);
        console.log(`  \x1b[32m[BDD] ${finalDegree}\x1b[0m`);
        if (currentCompany) console.log(`  \x1b[32m[JOB] ${currentCompany}\x1b[0m`);

      } catch (err: any) {
        console.error(`  \x1b[31m[ERREUR] ${err.message}\x1b[0m`);
      }
      
      // Pause plus courte pour accélerer le processus
      await page.waitForTimeout(2000 + Math.random() * 1000);
    }

  } finally {
    console.log(`\n\x1b[32m>>> MISSION TERMINÉE <<<\x1b[0m`);
    await browser.close();
  }
}

enrichProfiles().catch(console.error);
