import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Briefcase, Calendar } from 'lucide-react'

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold italic uppercase mb-4 text-primary">Alumni MDS</h1>
        <p className="text-xl text-muted-foreground">Le réseau professionnel des anciens étudiants.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Link href="/alumni">
          <Card className="hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full border-2">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-2xl">Annuaire</CardTitle>
              <CardDescription className="text-base">Retrouvez vos anciens camarades et développez votre réseau.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full border-2">
            <CardHeader>
              <Briefcase className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-2xl">Jobs</CardTitle>
              <CardDescription className="text-base">Consultez les offres d'emploi et de stage exclusives au réseau.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="opacity-60 h-full border-2 border-dashed">
          <CardHeader>
            <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Événements</CardTitle>
            <CardDescription className="text-base">Restez informé des prochains rassemblements (Prochainement).</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
