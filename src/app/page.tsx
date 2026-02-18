import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Briefcase, Calendar, AlertCircle } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur Alumni MDS</h1>
        <p className="text-muted-foreground mb-8">Rejoignez le réseau des anciens étudiants de l'école.</p>
        <Link href="/login">
          <Button size="lg">Se connecter pour commencer</Button>
        </Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isProfileComplete = profile?.first_name && profile?.last_name && profile?.degree

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Bonjour, {profile?.first_name || 'Alumni'} 👋</h1>
        <p className="text-muted-foreground">Ravi de vous revoir sur la plateforme.</p>
      </header>

      {!isProfileComplete && (
        <Card className="border-amber-200 bg-amber-50 mb-8">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Votre profil est incomplet</p>
              <p className="text-sm text-amber-700">Complétez vos informations pour être visible dans l'annuaire.</p>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Compléter mon profil
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Annuaire</CardTitle>
            <CardDescription>Retrouvez vos anciens camarades et développez votre réseau.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0">Consulter l'annuaire →</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <CardHeader>
            <Briefcase className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Offres d'emploi</CardTitle>
            <CardDescription>Consultez les dernières annonces CDI, CDD et Freelance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0">Voir les annonces →</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <CardHeader>
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Événements</CardTitle>
            <CardDescription>Restez informé des prochains rassemblements de l'école.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0">Agenda des événements →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
