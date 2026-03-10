import { updateProfile } from '@/app/profile/actions'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-lg mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group font-bold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mon Profil Alumni</CardTitle>
          <CardDescription>Complétez vos informations pour rejoindre l'annuaire.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" defaultValue={profile?.first_name || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" defaultValue={profile?.last_name || ''} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (lecture seule)</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">URL LinkedIn</Label>
              <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." defaultValue={profile?.linkedin_url || ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradYear">Année de diplôme</Label>
                <Input id="gradYear" name="gradYear" type="number" min="1950" max="2100" defaultValue={profile?.grad_year || 2024} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Diplôme</Label>
                <Input id="degree" name="degree" placeholder="ex: Master Expert IA" defaultValue={profile?.degree || ''} required />
              </div>
            </div>
            <Button type="submit" className="w-full pt-2">
              Enregistrer mon profil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
