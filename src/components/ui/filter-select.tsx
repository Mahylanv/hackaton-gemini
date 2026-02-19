'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function FilterSelect({ 
  name, 
  options, 
  defaultValue,
  placeholder 
}: { 
  name: string, 
  options: { label: string, value: string }[],
  defaultValue?: string,
  placeholder: string
}) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
