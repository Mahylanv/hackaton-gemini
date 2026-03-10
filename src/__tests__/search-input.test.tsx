import { SearchInput } from '@/components/ui/search-input'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const replaceMock = vi.fn()
let pathnameMock = '/alumni'
let searchParamsMock = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}))

describe('SearchInput', () => {
  beforeEach(() => {
    replaceMock.mockReset()
    pathnameMock = '/alumni'
    searchParamsMock = new URLSearchParams()
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
  })

  it('initializes input from query param', () => {
    searchParamsMock = new URLSearchParams('query=marie')

    render(<SearchInput placeholder="Rechercher..." />)

    expect(screen.getByPlaceholderText('Rechercher...')).toHaveValue('marie')
  })

  it('updates query param after debounce while preserving others', () => {
    searchParamsMock = new URLSearchParams('year=2024')

    render(<SearchInput placeholder="Rechercher..." />)

    // Flush initial effect from mount, then ignore it for this scenario.
    act(() => {
      vi.advanceTimersByTime(201)
    })
    replaceMock.mockClear()

    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
      target: { value: 'alice' },
    })

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(replaceMock).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    const lastCall = replaceMock.mock.calls.at(-1)?.[0] as string
    expect(lastCall).toContain('/alumni?')
    expect(lastCall).toContain('year=2024')
    expect(lastCall).toContain('query=alice')
  })

  it('removes query param when input is cleared', () => {
    searchParamsMock = new URLSearchParams('query=alice&year=2024')

    render(<SearchInput placeholder="Rechercher..." />)

    act(() => {
      vi.advanceTimersByTime(201)
    })
    replaceMock.mockClear()

    fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
      target: { value: '' },
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(replaceMock).toHaveBeenCalledWith('/alumni?year=2024')
  })
})
