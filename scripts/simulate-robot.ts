import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateRobot() {
  console.log(`
\x1b[44m\x1b[37m SIMULATION : ROBOT DE TEST (SANS LINKEDIN) \x1b[0m
`);

  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('*')
    .or('degree.eq.Importé via Excel,degree.is.null');

  if (!alumni || alumni.length === 0) {
    console.log("Aucun alumni à traiter. Importez d'abord le CSV.");
    return;
  }

  const fakeJobs = [
    { title: "Développeur Full Stack", company: "Google", logo: "https://logo.clearbit.com/google.com" },
    { title: "Product Designer", company: "Airbnb", logo: "https://logo.clearbit.com/airbnb.com" },
    { title: "Data Scientist", company: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
    { title: "Chef de Projet Digital", company: "Orange", logo: "https://logo.clearbit.com/orange.fr" }
  ];

  for (let i = 0; i < alumni.length; i++) {
    const person = alumni[i];
    const fakeData = fakeJobs[i % fakeJobs.length];
    
    console.log(`\x1b[35m[SIMUL] Scan de ${person.first_name} ${person.last_name}...\x1b[0m`);
    
    // On simule un temps de chargement de 3 secondes
    await new Promise(r => setTimeout(r, 3000));

    const { error: updateError } = await supabase
      .from('alumni')
      .update({
        current_job_title: fakeData.title,
        current_company: fakeData.company,
        company_logo: fakeData.logo,
        avatar_url: `https://i.pravatar.cc/150?u=${person.id}`, // Fausse photo
        degree: "Bachelor Digital / Master Expert en Stratégie Digitale",
        updated_at: new Date().toISOString()
      })
      .eq('id', person.id);

    if (updateError) console.error(`  \x1b[31m[ERREUR BDD] ${updateError.message}\x1b[0m`);
    else console.log(`  \x1b[32m[OK] Données simulées envoyées pour ${person.first_name}.\x1b[0m`);
  }

  console.log(`
\x1b[42m SIMULATION TERMINÉE \x1b[0m`);
}

simulateRobot();
