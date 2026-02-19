import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Parse un nom complet en prénom et nom.
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

export interface AlumniData {
  fullName: string;
  linkedinUrl: string;
  profileImageUrl?: string;
  degree?: string;
  entryYear?: string | number;
  gradYear?: string | number;
  email?: string;
}

/**
 * Récupère les alumni via Apollo.io (Alternative à Proxycurl)
 * Note: Nécessite une clé APOLLO_API_KEY.
 */
export async function fetchAlumniFromLinkedIn(): Promise<AlumniData[]> {
  const apiKey = process.env.APOLLO_API_KEY;
  
  if (!apiKey) {
    console.warn('[WARN] Aucune clé APOLLO_API_KEY trouvée. Simulation de données.');
    return [
      {
        fullName: "Alumni de Test " + Math.floor(Math.random() * 100),
        linkedinUrl: "https://linkedin.com/in/alumni-" + Date.now(),
        degree: "MBA Management",
        gradYear: 2025,
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random()
      }
    ];
  }

  // Exemple d'appel API Apollo.io pour chercher des personnes par école
  const response = await fetch('https://api.apollo.io/v1/people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apiKey
    },
    body: JSON.stringify({
      person_schools: ["MyDigitalSchool"],
      page: 1,
      display_mode: "full"
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[ERROR] Apollo API returned ${response.status}: ${errorBody}`);
    throw new Error(`Échec du scraping via Apollo API (Status: ${response.status})`);
  }
  
  const result = await response.json();
  
  return result.people.map((p: any) => ({
    fullName: p.first_name + ' ' + p.last_name,
    linkedinUrl: p.linkedin_url,
    profileImageUrl: p.photo_url,
    degree: p.title,
    gradYear: p.education?.[0]?.end_year || null
  }));
}

/**
 * Synchronise une liste d'alumni avec la base de données.
 */
export async function syncAlumniData(supabase: SupabaseClient, data: AlumniData[]) {
  let successCount = 0;
  let errorCount = 0;
  const logs: string[] = [];

  for (const item of data) {
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
      logs.push(`[ERROR] ${item.fullName}: ${error.message}`);
      errorCount++;
    } else {
      logs.push(`[SUCCESS] ${item.fullName} synchronisé.`);
      successCount++;
    }
  }

  return { successCount, errorCount, logs };
}
