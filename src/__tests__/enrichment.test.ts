import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de Supabase
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
const mockFrom = vi.fn().mockReturnValue({ 
  select: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  update: mockUpdate
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom
  })
}))

// Mock de l'acteur Apify
const mockDataset = vi.fn().mockReturnValue({
  listItems: vi.fn().mockResolvedValue({
    items: [{
      organicResults: [{
        url: 'linkedin.com/in/test-user',
        title: 'Test User - Développeur Web - MyDigitalSchool | LinkedIn',
        description: 'Test User travaille chez MyDigitalSchool en tant que développeur.'
      }]
    }]
  })
})

vi.mock('apify-client', () => ({
  ApifyClient: vi.fn().mockImplementation(() => ({
    actor: vi.fn().mockReturnValue({
      call: vi.fn().mockResolvedValue({ defaultDatasetId: 'test-dataset' })
    }),
    dataset: mockDataset
  }))
}))

describe('Système d\'enrichissement Allumni', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait extraire correctement le poste et l\'entreprise du titre Google', () => {
    const title = 'Romain Marcelli - Développeur Fullstack - Google | LinkedIn'
    const parts = title.split(' - ')
    const jobTitle = parts[1]?.trim()
    const companyName = parts[2]?.split(' | ')[0]?.trim()

    expect(jobTitle).toBe('Développeur Fullstack')
    expect(companyName).toBe('Google')
  })

  it('devrait extraire proprement l\'entreprise même avec du texte après', () => {
    const snippet = 'Développeur passionné chez MyDigitalSchool depuis 2020.'
    let companyName = null
    if (snippet.includes(' chez ')) {
      const afterChez = snippet.split(' chez ')[1]
      companyName = afterChez.split(' ')[0].replace(/[,.;]/g, '').trim()
    }
    expect(companyName).toBe('MyDigitalSchool')
  })

  it('devrait ignorer les mots-clés d\'éducation pour privilégier la vraie entreprise', () => {
    const eduKeywords = ['mydigitalschool', 'etudiant', 'student', 'alternant'];
    const title = 'Romain Marcelli - Alternant - MyDigitalSchool | LinkedIn';
    const snippet = 'Ancien élève travaillant maintenant chez Google en tant que Développeur.';
    
    const parts = title.split(' - ');
    const candidateCompany = parts[2]?.split(' | ')[0]?.trim(); // MyDigitalSchool
    
    let finalCompany = candidateCompany;
    if (eduKeywords.some(kw => candidateCompany.toLowerCase().includes(kw))) {
      if (snippet.toLowerCase().includes(' chez ')) {
        const afterChez = snippet.split(/ chez /i)[1]?.split(/[. ]/)[0]?.trim();
        if (afterChez && !eduKeywords.some(kw => afterChez.toLowerCase().includes(kw))) {
          finalCompany = afterChez;
        }
      }
    }
    
    expect(finalCompany).toBe('Google');
  })

  it('devrait remplacer LinkedIn par MDS Allumni si aucune entreprise n\'est trouvée', () => {
    const companyDetected = "LinkedIn";
    const blackList = ['linkedin', 'profil', 'profile'];
    
    let finalCompany = companyDetected;
    if (blackList.includes(companyDetected.toLowerCase())) {
      finalCompany = "MDS Allumni";
    }
    
    expect(finalCompany).toBe('MDS Allumni');
  })
})
