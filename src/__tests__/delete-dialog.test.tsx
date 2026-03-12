import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DeleteAlumniDialog } from '@/components/features/alumni/DeleteAlumniDialog'

// Mock des actions server
vi.mock('@/app/admin/actions', () => ({
  deleteAlumnus: vi.fn().mockResolvedValue({ success: true })
}))

describe('DeleteAlumniDialog', () => {
  const mockAllumni = {
    id: '123',
    first_name: 'Romain',
    last_name: 'Marcelli'
  }
  const mockOnSuccess = vi.fn()

  it('devrait ouvrir la modal lors du clic sur le bouton de suppression', async () => {
    render(<DeleteAlumniDialog allumni={mockAllumni} onSuccess={mockOnSuccess} />)
    
    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)
    
    expect(screen.getByText(/Action Irréversible/i)).toBeDefined()
    expect(screen.getByText(/Romain Marcelli/i)).toBeDefined()
  })

  it('devrait appeler la fonction de suppression lors de la confirmation', async () => {
    const actions = await import('@/app/admin/actions')
    render(<DeleteAlumniDialog allumni={mockAllumni} onSuccess={mockOnSuccess} />)
    
    // Ouvrir la modal
    fireEvent.click(screen.getByRole('button'))
    
    // Cliquer sur confirmer
    const confirmButton = screen.getByText(/Supprimer le profil/i)
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(actions.deleteAlumnus).toHaveBeenCalledWith('123')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})
