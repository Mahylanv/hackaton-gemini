import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import Link from 'next/link'
import { GraduationCap, Mail, Linkedin } from 'lucide-react'
import { Suspense } from 'react'

export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  const params = await searchParams
  const query = params.query as string || ''
  const year = params.year as string || ''

  let supabaseQuery = supabase
    .from('alumni')
    .select('*')
    .order('last_name', { ascending: true })

  if (query) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
  }

  if (year) {
    supabaseQuery = supabaseQuery.eq('grad_year', parseInt(year))
  }

  const { data: alumni, error } = await supabaseQuery

  return (
    <div className="min-h-screen bg-pro-max">
      <div className="container mx-auto px-4 py-12 relative">
        <header className="mb-12 space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="h-3.5 w-3.5" /> Réseau Alumni
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Annuaire</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              Connectez-vous avec les anciens diplômés et développez votre réseau professionnel.
            </p>
          </div>

          <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row gap-3 items-center bg-background p-3 rounded-2xl border shadow-lg">
            <div className="flex-1 w-full">
              <Suspense fallback={<div className="w-full h-12 bg-muted animate-pulse rounded-xl" />}>
                <SearchInput placeholder="Rechercher un alumni par nom ou prénom..." />
              </Suspense>
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <input 
                name="year" 
                type="number"
                placeholder="Année" 
                defaultValue={year}
                className="flex h-12 w-full md:w-24 rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const params = new URLSearchParams(window.location.search)
                    params.set('year', (e.target as HTMLInputElement).value)
                    window.location.search = params.toString()
                  }
                }}
              />
              {(query || year) && (
                <Link href="/alumni">
                  <Button variant="ghost" className="h-12 font-bold px-6">Effacer</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {error ? (
          <div className="p-8 text-center bg-destructive/5 border border-destructive/20 rounded-2xl text-destructive font-bold">
            Une erreur est survenue lors de la récupération des données.
          </div>
        ) : alumni && alumni.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((profile) => (
              <Card key={profile.id} className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <CardHeader className="pb-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {profile.first_name} {profile.last_name}
                    </CardTitle>
                    <span className="text-xs font-black bg-muted px-2 py-1 rounded-md uppercase tracking-wider">
                      Promo {profile.grad_year}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                    {profile.degree}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="h-px bg-border w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-medium truncate">{profile.email}</span>
                    </div>
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#0A66C2] hover:text-white transition-all duration-300"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-background border-2 border-dashed rounded-3xl">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold text-muted-foreground">Aucun alumni trouvé.</p>
            <p className="text-muted-foreground mt-1">Essayez d'ajuster vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  )
}
