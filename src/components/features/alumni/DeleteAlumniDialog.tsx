'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { deleteAlumnus } from '@/app/admin/actions'

interface DeleteAlumniDialogProps {
  allumni: {
    id: string
    first_name: string
    last_name: string
  }
  onSuccess: () => void
}

export function DeleteAlumniDialog({ allumni, onSuccess }: DeleteAlumniDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteAlumnus(allumni.id)
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-12 w-12 rounded-2xl text-slate-300 hover:bg-rose-500 hover:text-white transition-all border border-transparent hover:shadow-xl active:scale-90"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-2">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-center text-secondary">
              Action Irréversible
            </DialogTitle>
            <DialogDescription className="text-center font-bold text-slate-500 text-sm uppercase tracking-widest leading-relaxed">
              Êtes-vous absolument sûr de vouloir supprimer définitivement le profil de 
              <span className="text-rose-600 block mt-1 text-lg">{allumni.first_name} {allumni.last_name}</span> 
              de la base de données Allumni ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 sm:justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-14 px-8 rounded-2xl font-black uppercase italic text-slate-400 hover:bg-slate-50 border-2"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-14 px-8 rounded-2xl font-black uppercase italic bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
              Supprimer le profil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
