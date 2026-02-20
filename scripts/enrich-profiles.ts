import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LINKEDIN_EMAIL = "rm1.marcelli@gmail.com";
const LINKEDIN_PASSWORD = "Romain31";

async function enrichProfiles() {
  console.log(`\n\x1b[44m\x1b[37m MISSION : EXTRACTION POSTE & ENTREPRISE \x1b[0m\n`);

  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    // On ne traite que ceux qui n'ont pas encore d'entreprise ou de job title
    .or('current_company.is.null,current_job_title.is.null');

  if (!alumni || alumni.length === 0) {
    console.log('\x1b[33m[INFO] Tous les profils sont déjà à jour.\x1b[0m');
    return;
  }

  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.linkedin.com/login');
    await page.fill('#username', LINKEDIN_EMAIL);
    await page.fill('#password', LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*linkedin\.com\/.*/, { timeout: 300000 });
    
    console.log(`\x1b[32m[OK] Robot prêt !\x1b[0m`);

    for (const person of alumni) {
      console.log(`\n\x1b[35m>>> ANALYSE : ${person.first_name} ${person.last_name} <<<\x1b[0m`);
      
      try {
        await page.goto(person.linkedin_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // --- SCROLL STRATÉGIQUE POUR CHARGER LES SECTIONS ---
        // On scrolle loin vers le bas puis on remonte
        await page.evaluate(() => window.scrollTo(0, 2000));
        await page.waitForTimeout(2000);
        await page.evaluate(() => window.scrollTo(0, 500)); 

        // --- 1. PHOTO DE PROFIL ---
        const avatarUrl = await page.getAttribute('.pv-top-card-profile-picture__image--show, .pv-top-card__photo img', 'src').catch(() => null);

        // --- 2. EXTRACTION EXPÉRIENCE ---
        let jobTitle = null;
        let companyName = null;
        let companyLogo = null;

        // On cherche le bloc d'expérience (le premier de la liste)
        const firstExp = page.locator('li.pvs-list__paged-list-item').first();
        
        if (await firstExp.isVisible({ timeout: 5000 })) {
            console.log(`  - Section Expérience détectée.`);
            
            // Titre du poste
            jobTitle = await firstExp.locator('.hoverable-link-text.t-bold span[aria-hidden="true"]').first().innerText().catch(() => null);
            
            // Nom de l'entreprise
            companyName = await firstExp.locator('.t-14.t-normal span[aria-hidden="true"]').first().innerText().catch(() => null);
            
            // Logo
            companyLogo = await firstExp.locator('img.ivm-view-attr__img--centered').first().getAttribute('src').catch(() => null);
            
            if (companyName) companyName = companyName.split('·')[0].trim();
        } else {
            // Tentative de secours : Headline (si pas d'expérience visible)
            console.log(`  - Expérience non trouvée, récupération du Headline.`);
            jobTitle = await page.innerText('.text-body-medium.break-words').catch(() => null);
        }

        console.log(`  \x1b[34m[JOB] ${jobTitle || 'Non trouvé'}\x1b[0m`);
        console.log(`  \x1b[34m[BOX] ${companyName || 'Non trouvé'}\x1b[0m`);

        // MISE À JOUR BDD (On garde les infos du CSV, on ne touche qu'aux nouvelles colonnes)
        await supabase.from('alumni').update({
          avatar_url: avatarUrl || person.avatar_url,
          current_job_title: jobTitle?.trim() || null,
          current_company: companyName?.trim() || null,
          company_logo: companyLogo || null,
          updated_at: new Date().toISOString()
        }).eq('id', person.id);

        console.log(`  \x1b[32m[BDD] Mise à jour terminée.\x1b[0m`);

      } catch (err: any) {
        console.error(`  \x1b[31m[ERREUR] ${err.message}\x1b[0m`);
      }
      
      await page.waitForTimeout(2000 + Math.random() * 1000);
    }

  } finally {
    console.log(`\n\x1b[42m MISSION TERMINÉE \x1b[0m`);
    await browser.close().catch(() => {});
  }
}

enrichProfiles().catch(console.error);
