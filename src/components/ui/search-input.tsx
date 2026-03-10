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
    <div className="relative w-full">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pr-10 h-12 text-base rounded-xl shadow-sm border-2 focus:border-primary transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="h-5 w-5 text-muted-foreground/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
