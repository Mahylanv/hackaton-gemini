import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const REALISTIC_JOBS = [
  { title: "Développeur Front-End", company: "Publicis Sapient", logo: "https://logo.clearbit.com/publicis.sapient.com" },
  { title: "Chef de Projet Digital", company: "Capgemini", logo: "https://logo.clearbit.com/capgemini.com" },
  { title: "UX/UI Designer", company: "Doctolib", logo: "https://logo.clearbit.com/doctolib.fr" },
  { title: "Product Owner", company: "Decathlon Digital", logo: "https://logo.clearbit.com/decathlon.fr" },
  { title: "Développeur Fullstack", company: "Scalian", logo: "https://logo.clearbit.com/scalian.com" },
  { title: "Consultant SEO", company: "Resoneo", logo: "https://logo.clearbit.com/resoneo.com" },
  { title: "Traffic Manager", company: "Gambit", logo: "https://logo.clearbit.com/gambit.com" },
  { title: "Alternant Développeur", company: "SNCF Connect", logo: "https://logo.clearbit.com/sncf-connect.com" },
  { title: "Freelance Webdesigner", company: "Indépendant", logo: null }, // Pas de logo pour freelance
  { title: "Data Analyst", company: "Carrefour", logo: "https://logo.clearbit.com/carrefour.com" }
];

const DEGREES = [
  "Bachelor Développeur Web",
  "Bachelor Webmarketing & Social Media",
  "MBA Expert UI/UX Design",
  "MBA Directeur Artistique Digital",
  "MBA Développeur Full-Stack",
  "Master Marketing Digital"
];

async function simulateRobot() {
  console.log(`\n\x1b[44m\x1b[37m 🚀 SIMULATION : DONNÉES RÉALISTES MYDIGITALSCHOOL \x1b[0m\n`);

  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    .or('degree.eq.Importé via Excel,degree.is.null');

  if (!alumni || alumni.length === 0) {
    console.log("Aucun alumni à traiter. Importez d'abord le CSV.");
    return;
  }

  for (let i = 0; i < alumni.length; i++) {
    const person = alumni[i];
    
    // Sélection aléatoire cohérente
    const jobInfo = REALISTIC_JOBS[Math.floor(Math.random() * REALISTIC_JOBS.length)];
    const degreeInfo = DEGREES[Math.floor(Math.random() * DEGREES.length)];
    const isPlaced = Math.random() > 0.2; // 80% de chance d'être en poste

    console.log(`\x1b[36m[SIMUL] Enrichment de ${person.first_name} ${person.last_name}...\x1b[0m`);
    
    // Simulation délai réseau (rapide pour le test)
    await new Promise(r => setTimeout(r, 800));

    const { error: updateError } = await supabase
      .from('alumni')
      .update({
        current_job_title: isPlaced ? jobInfo.title : null,
        current_company: isPlaced ? jobInfo.company : null,
        company_logo: isPlaced ? jobInfo.logo : null,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.id}&backgroundColor=b6e3f4`,
        degree: degreeInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', person.id);

    if (updateError) console.error(`  \x1b[31m[ERREUR] ${updateError.message}\x1b[0m`);
    else console.log(`  \x1b[32m[OK] ${isPlaced ? `${jobInfo.title} chez ${jobInfo.company}` : "En recherche"}\x1b[0m`);
  }

  console.log(`\n\x1b[42m BASE DE DONNÉES ENRICHIE \x1b[0m`);
}

simulateRobot();
