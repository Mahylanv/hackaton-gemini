'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function YearFilter({
  defaultValue,
  years,
}: {
  defaultValue: string
  years: number[]
}) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('year', value)
    } else {
      params.delete('year')
    }

    replace(`${pathname}?${params.toString()}`)
  }

  const value = searchParams.get('year') ?? defaultValue

  return (
    <select
      name="year"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="flex h-12 w-full md:w-32 rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      aria-label="Filtrer par année"
    >
      <option value="">Année</option>
      {years.map((year) => (
        <option key={year} value={year.toString()}>
          {year}
        </option>
      ))}
    </select>
  )
}
