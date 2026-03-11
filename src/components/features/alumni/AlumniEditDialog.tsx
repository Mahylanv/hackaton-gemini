'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pencil, Loader2 } from 'lucide-react'
import { updateAlumnus } from '@/app/admin/actions'

export function AlumniEditDialog({ alumnus }: { alumnus: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    try {
      await updateAlumnus(alumnus.id, formData)
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 px-4 rounded-xl border-2 border-slate-200 font-black uppercase italic text-xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-2"
        >
          <Pencil className="h-3.5 w-3.5" /> Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-[2rem] border-4 border-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-secondary">Modifier l'Allumni</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prénom</Label>
              <Input id="first_name" name="first_name" defaultValue={alumnus.first_name} required className="h-12 rounded-xl border-2 focus:ring-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom</Label>
              <Input id="last_name" name="last_name" defaultValue={alumnus.last_name} required className="h-12 rounded-xl border-2 focus:ring-primary/10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lien LinkedIn</Label>
            <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={alumnus.linkedin_url} required className="h-12 rounded-xl border-2 focus:ring-primary/10" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grad_year" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Année de diplôme</Label>
              <Input id="grad_year" name="grad_year" type="number" defaultValue={alumnus.grad_year} className="h-12 rounded-xl border-2 focus:ring-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diplôme</Label>
              <Input id="degree" name="degree" defaultValue={alumnus.degree} className="h-12 rounded-xl border-2 focus:ring-primary/10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_job_title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Poste actuel</Label>
            <Input id="current_job_title" name="current_job_title" defaultValue={alumnus.current_job_title} className="h-12 rounded-xl border-2 focus:ring-primary/10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_company" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entreprise actuelle</Label>
            <Input id="current_company" name="current_company" defaultValue={alumnus.current_company} className="h-12 rounded-xl border-2 focus:ring-primary/10" />
          </div>

          <Button type="submit" className="w-full h-14 bg-secondary hover:bg-black text-white rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-slate-200 transition-all mt-4" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enregistrement...</> : "Enregistrer les modifications"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>

  )
}
