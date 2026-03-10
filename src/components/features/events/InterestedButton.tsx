'use client'

import { Button } from '@/components/ui/button'
import { toggleEventInterest } from '@/app/admin/actions'
import { useState } from 'react'
import { Check } from 'lucide-react'

interface InterestedButtonProps {
  eventId: string
  initialCount: number
  hasInterestsAlready: boolean
}

export function InterestedButton({ eventId, initialCount, hasInterestsAlready }: InterestedButtonProps) {
  const [isInterested, setIsInterested] = useState(hasInterestsAlready)
  const [count, setCount] = useState(initialCount)
  const [isPending, setIsPending] = useState(false)

  async function handleAction() {
    setIsPending(true)
    
    // Optimistic update
    const nextInterested = !isInterested
    setIsInterested(nextInterested)
    setCount(prev => nextInterested ? prev + 1 : prev - 1)

    try {
      await toggleEventInterest(eventId)
    } catch (error) {
      console.error(error)
      // Revert on error
      setIsInterested(!nextInterested)
      setCount(prev => nextInterested ? prev - 1 : prev + 1)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-2 text-center w-full">
      <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">
        {count} {count > 1 ? 'Intéressés' : 'Intéressé'}
      </p>
      <p className="text-sm font-semibold text-muted-foreground mb-4">
        {isInterested ? "Vous y participez !" : "Rejoignez-les !"}
      </p>
      
      <Button 
        onClick={handleAction}
        disabled={isPending}
        variant={isInterested ? "secondary" : "default"}
        className="w-full h-14 text-lg font-black italic uppercase tracking-tighter shadow-xl transition-all active:scale-95 gap-2"
      >
        {isInterested ? (
          <>
            <Check className="h-5 w-5" /> Désintéressé
          </>
        ) : (
          "Ça m'intéresse !"
        )}
      </Button>
    </div>
  )
}
