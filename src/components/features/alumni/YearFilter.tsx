'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function YearFilter({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString())
      const value = e.currentTarget.value
      
      if (value) {
        params.set('year', value)
      } else {
        params.delete('year')
      }
      
      router.push(`/alumni?${params.toString()}`)
    }
  }

  return (
    <input 
      name="year" 
      type="number"
      placeholder="Année" 
      defaultValue={defaultValue}
      className="flex h-12 w-full md:w-24 rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      onKeyDown={handleKeyDown}
    />
  )
}
