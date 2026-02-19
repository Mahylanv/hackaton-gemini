'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useEffect, useState } from 'react'
import { Input } from './input'
import { Loader2 } from 'lucide-react'

export function SearchInput({ placeholder }: { placeholder: string }) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchTerm) {
        params.set('query', searchTerm)
      } else {
        params.delete('query')
      }

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`)
      })
    }, 200)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, replace, searchParams])

  return (
    <div className="relative w-full md:w-64">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pr-8"
      />
      {isPending && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
