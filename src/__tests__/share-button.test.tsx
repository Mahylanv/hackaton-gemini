import { ShareButton } from '@/components/features/events/ShareButton'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('ShareButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses Web Share API when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
    })

    render(<ShareButton title="Soirée Alumni" />)
    fireEvent.click(screen.getByRole('button', { name: /partager/i }))

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledWith({
        title: 'Soirée Alumni',
        text: "Découvrez l'événement : Soirée Alumni",
        url: window.location.href,
      })
    })
  })

  it('falls back to clipboard when Web Share API is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })

    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    })

    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    render(<ShareButton title="Conférence Produit" />)
    fireEvent.click(screen.getByRole('button', { name: /partager/i }))

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(window.location.href)
    })
    expect(alertMock).toHaveBeenCalledWith('Lien copié dans le presse-papier !')
  })
})
