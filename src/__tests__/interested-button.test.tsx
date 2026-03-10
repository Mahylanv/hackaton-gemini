import { InterestedButton } from '@/components/features/events/InterestedButton'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/admin/actions', () => ({
  toggleEventInterest: vi.fn(),
}))

import { toggleEventInterest } from '@/app/admin/actions'

describe('InterestedButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(toggleEventInterest).mockReset()
  })

  it('applies optimistic update on success', async () => {
    vi.mocked(toggleEventInterest).mockResolvedValue(undefined as never)

    render(
      <InterestedButton
        eventId="event-1"
        initialCount={1}
        hasInterestsAlready={false}
      />
    )

    expect(screen.getByText('1 Intéressé')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('2 Intéressés')).toBeInTheDocument()
    expect(screen.getByText('Désintéressé')).toBeInTheDocument()

    await waitFor(() => {
      expect(toggleEventInterest).toHaveBeenCalledWith('event-1')
    })
  })

  it('reverts optimistic update when action fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(toggleEventInterest).mockRejectedValue(new Error('network error'))

    render(
      <InterestedButton
        eventId="event-2"
        initialCount={1}
        hasInterestsAlready={false}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('2 Intéressés')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('1 Intéressé')).toBeInTheDocument()
    })
    expect(screen.getByText("Ça m'intéresse !")).toBeInTheDocument()
  })
})
