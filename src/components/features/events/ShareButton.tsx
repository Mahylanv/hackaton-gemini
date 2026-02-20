'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Découvrez l'événement : ${title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Erreur lors du partage:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Lien copié dans le presse-papier !')
      } catch (err) {
        console.error('Erreur lors de la copie:', err)
      }
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full h-12 font-bold gap-2 transition-all active:scale-95" 
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" /> Partager
    </Button>
  )
}
