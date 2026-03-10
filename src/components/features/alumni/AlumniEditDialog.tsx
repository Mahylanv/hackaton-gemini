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
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Pencil className="h-3 w-3" /> Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier l'Alumnus</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" name="first_name" defaultValue={alumnus.first_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" name="last_name" defaultValue={alumnus.last_name} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">Lien LinkedIn</Label>
            <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={alumnus.linkedin_url} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grad_year">Année de diplôme</Label>
              <Input id="grad_year" name="grad_year" type="number" defaultValue={alumnus.grad_year} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Diplôme</Label>
              <Input id="degree" name="degree" defaultValue={alumnus.degree} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_job_title">Poste actuel</Label>
            <Input id="current_job_title" name="current_job_title" defaultValue={alumnus.current_job_title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_company">Entreprise actuelle</Label>
            <Input id="current_company" name="current_company" defaultValue={alumnus.current_company} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Enregistrer les modifications"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
