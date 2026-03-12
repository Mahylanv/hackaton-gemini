import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminAlumniPage from '@/app/admin/alumni/page'

// Mock de Supabase Client
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  })
}))

// Mock des actions server
vi.mock('../actions', () => ({
  importExcelData: vi.fn(),
  startEnrichmentScan: vi.fn(),
  getEnrichmentProgress: vi.fn().mockResolvedValue({ processed: 0, total: 0, percentage: 0 }),
  deleteAlumnus: vi.fn(),
}))

describe('AdminAlumniPage - Terminologie Allumni', () => {
  it('devrait afficher "Allumni" avec deux "l" dans le titre principal', async () => {
    render(<AdminAlumniPage />)
    const titles = screen.getAllByText(/Allumni/i)
    const hasDoubleL = titles.some(t => t.textContent?.includes('Allumni'))
    expect(hasDoubleL).toBe(true)
  })

  it('devrait afficher "Annuaire Global" dans la section base de données', () => {
    render(<AdminAlumniPage />)
    expect(screen.getByText(/Annuaire Global/i)).toBeDefined()
  })
})
