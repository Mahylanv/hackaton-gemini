import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { loadEnvConfig } from '@next/env';

// Charger les variables d'environnement
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * Initialise le client Supabase.
 */
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('[CRITICAL] Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Parse un nom complet en prénom et nom.
 * @param fullName Le nom complet (ex: "Jean-Baptiste de La Salle")
 */
export function parseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

/**
 * Valide et convertit une année en nombre ou null.
 */
export function parseYear(year: string | number | undefined | null): number | null {
  if (year === undefined || year === null || year === '') return null;
  const parsed = parseInt(year.toString());
  return isNaN(parsed) ? null : parsed;
}

interface AlumniData {
  fullName: string;
  linkedinUrl: string;
  profileImageUrl?: string;
  degree?: string;
  entryYear?: string | number;
  gradYear?: string | number;
  email?: string;
}

async function importAlumni() {
  const supabase = getSupabaseClient();
  const filePath = path.join(projectDir, 'alumni-data.json');
  console.log(`[INFO] ${new Date().toISOString()} - Début du processus d'importation...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] Le fichier de données est introuvable à l'emplacement: ${filePath}`);
    return;
  }

  let data: AlumniData[];
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(rawData);
    console.log(`[INFO] Fichier JSON lu avec succès (${data.length} entrées trouvées).`);
  } catch (err) {
    console.error(`[ERROR] Échec de la lecture ou du parsing du JSON:`, err);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const { firstName, lastName } = parseName(item.fullName);
    
    const alumniData = {
      first_name: firstName,
      last_name: lastName,
      linkedin_url: item.linkedinUrl,
      avatar_url: item.profileImageUrl || null,
      degree: item.degree || 'Non spécifié',
      entry_year: parseYear(item.entryYear),
      grad_year: parseYear(item.gradYear),
      email: item.email || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('alumni')
      .upsert(alumniData, { onConflict: 'linkedin_url' });

    if (error) {
      console.error(`[ERROR] [${i+1}/${data.length}] Échec pour ${item.fullName}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`[SUCCESS] [${i+1}/${data.length}] ${item.fullName} synchronisé.`);
      successCount++;
    }
  }

  console.log(`\n[RAPPORT FINAL] ${new Date().toISOString()}`);
  console.log(`- Total traités: ${data.length}`);
  console.log(`- Succès: ${successCount}`);
  console.log(`- Erreurs: ${errorCount}`);
}

// Lancer l'import uniquement si le script est exécuté directement
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith('import-alumni.ts')) {
  importAlumni().catch(err => {
    console.error('[CRITICAL] Erreur non gérée lors de l\'import:', err.message);
    process.exit(1);
  });
}
