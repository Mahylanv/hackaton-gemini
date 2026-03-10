import { SyncAlumniButton } from '@/components/features/sync-button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/alumni/sync-actions', () => ({
  syncAlumni: vi.fn(),
}))

import { syncAlumni } from '@/app/alumni/sync-actions'

describe('SyncAlumniButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(syncAlumni).mockReset()
  })

  it('shows success message when sync succeeds', async () => {
    vi.mocked(syncAlumni).mockResolvedValue({
      success: true,
      message: '3 alumni synchronisés en direct (0 erreurs).',
      logs: [],
    })

    render(<SyncAlumniButton />)
    fireEvent.click(screen.getByRole('button', { name: /synchroniser alumni/i }))

    await waitFor(() => {
      expect(syncAlumni).toHaveBeenCalled()
    })
    expect(
      screen.getByText('3 alumni synchronisés en direct (0 erreurs).')
    ).toBeInTheDocument()
  })

  it('shows action error message when sync returns error', async () => {
    vi.mocked(syncAlumni).mockResolvedValue({
      error: 'Configuration manquante',
    })

    render(<SyncAlumniButton />)
    fireEvent.click(screen.getByRole('button', { name: /synchroniser alumni/i }))

    await waitFor(() => {
      expect(screen.getByText('Configuration manquante')).toBeInTheDocument()
    })
  })

  it('shows fallback message on unexpected exception', async () => {
    vi.mocked(syncAlumni).mockRejectedValue(new Error('boom'))

    render(<SyncAlumniButton />)
    fireEvent.click(screen.getByRole('button', { name: /synchroniser alumni/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Une erreur inattendue est survenue.')
      ).toBeInTheDocument()
    })
  })
})
