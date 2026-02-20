'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncAlumni } from '@/app/alumni/sync-actions'
import { Loader2, RefreshCw } from 'lucide-react'

export function SyncAlumniButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message: string } | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await syncAlumni()
      if ('error' in response) {
        setResult({ success: false, message: response.error as string })
      } else {
        setResult({ success: true, message: response.message })
      }
    } catch (err) {
      setResult({ success: false, message: 'Une erreur inattendue est survenue.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button 
        onClick={handleSync} 
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Synchroniser Alumni
      </Button>
      
      {result && (
        <p className={`text-xs font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
