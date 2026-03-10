import { FilterSelect } from '@/components/ui/filter-select'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replaceMock = vi.fn()
let pathnameMock = '/jobs'
let searchParamsMock = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}))

describe('FilterSelect', () => {
  beforeEach(() => {
    replaceMock.mockReset()
    pathnameMock = '/jobs'
    searchParamsMock = new URLSearchParams()
  })

  it('renders placeholder and options', () => {
    render(
      <FilterSelect
        name="type"
        placeholder="Type"
        defaultValue=""
        options={[
          { label: 'CDI', value: 'cdi' },
          { label: 'Alternance', value: 'alternance' },
        ]}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Type' })).toHaveValue('')
    expect(screen.getByRole('option', { name: 'CDI' })).toHaveValue('cdi')
    expect(screen.getByRole('option', { name: 'Alternance' })).toHaveValue(
      'alternance'
    )
  })

  it('sets selected value while preserving existing query params', () => {
    searchParamsMock = new URLSearchParams('query=designer')

    render(
      <FilterSelect
        name="type"
        placeholder="Type"
        options={[
          { label: 'CDI', value: 'cdi' },
          { label: 'Alternance', value: 'alternance' },
        ]}
      />
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cdi' } })

    expect(replaceMock).toHaveBeenCalledWith('/jobs?query=designer&type=cdi')
  })

  it('removes filter param when empty option is selected', () => {
    searchParamsMock = new URLSearchParams('query=designer&type=cdi')

    render(
      <FilterSelect
        name="type"
        placeholder="Type"
        defaultValue="cdi"
        options={[
          { label: 'CDI', value: 'cdi' },
          { label: 'Alternance', value: 'alternance' },
        ]}
      />
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })

    expect(replaceMock).toHaveBeenCalledWith('/jobs?query=designer')
  })
})
