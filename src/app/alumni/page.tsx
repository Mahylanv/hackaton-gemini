import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { YearFilter } from '@/components/features/alumni/YearFilter'
import Link from 'next/link'
import { GraduationCap, Mail, Linkedin, CheckCircle, X, Building2, Calendar, Clock } from 'lucide-react'
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
              <Suspense fallback={<div className="h-12 w-24 bg-muted animate-pulse rounded-xl" />}>
                <YearFilter defaultValue={year} />
              </Suspense>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {alumni.map((profile) => {
              const isVerified = profile.degree && profile.degree !== 'Importé via Excel' && profile.degree !== 'Parcours non trouvé';
              const isNotFound = profile.degree === 'Parcours non trouvé';

              return (
                <Card key={profile.id} className="group relative bg-card border-2 transition-all duration-500 hover:border-primary hover:shadow-2xl hover:-translate-y-1 overflow-hidden flex flex-col">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {isVerified && (
                      <div className="bg-primary px-3 py-1 rounded-full flex items-center gap-1.5 text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <CheckCircle className="h-3 w-3" />
                        Vérifié
                      </div>
                    )}
                    {isNotFound && (
                      <div className="bg-muted px-3 py-1 rounded-full flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <X className="h-3 w-3" />
                        Inconnu
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-4 space-y-4 pt-8">
                    <div className="flex items-end justify-between">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden bg-muted p-1 shadow-inner ring-1 ring-border">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.first_name}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-black text-2xl uppercase">
                              {profile.first_name?.[0]}{profile.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        {profile.company_logo && (
                          <div className="absolute -bottom-2 -right-2 h-9 w-9 bg-background p-1.5 rounded-xl shadow-lg border border-border ring-1 ring-border">
                            <img src={profile.company_logo} alt={profile.current_company} className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-black bg-muted px-3 py-1 rounded-full uppercase tracking-wider text-muted-foreground">
                        Promo {profile.grad_year || '?'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors uppercase italic">
                        {profile.first_name} {profile.last_name}
                      </CardTitle>
                      {profile.current_job_title && (
                        <p className="text-xs font-bold text-muted-foreground mt-0.5 line-clamp-1 italic">
                          {profile.current_job_title}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          MyDigitalSchool
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4 flex-1 flex flex-col">
                    <div className="h-px bg-border w-full" />
                    
                    <div className="space-y-3 flex-1">
                      {profile.current_company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary shrink-0" />
                          <p className="text-sm font-bold text-foreground truncate">
                            {profile.current_company}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <GraduationCap className={`h-4 w-4 mt-0.5 shrink-0 ${isNotFound ? 'text-muted-foreground' : 'text-primary'}`} />
                        <p className={`text-sm font-medium leading-snug line-clamp-2 ${isNotFound ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                          {profile.degree || 'En attente de vérification'}
                        </p>
                      </div>

                      {profile.entry_year && !isNotFound && (
                        <div className="flex items-center gap-2 opacity-60">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            Cursus : {profile.entry_year} — {profile.grad_year || '?'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      {profile.linkedin_url && (
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 h-11 rounded-2xl bg-secondary text-secondary-foreground text-[10px] font-black flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 tracking-widest"
                        >
                          <Linkedin className="h-4 w-4" />
                          VOIR PROFIL
                        </a>
                      )}
                      <a 
                        href={`mailto:${profile.email || '#'}`} 
                        className="h-11 w-11 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-sm"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-background rounded-[3rem] border-4 border-dashed border-border shadow-inner">
            <GraduationCap className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Aucun membre trouvé</h3>
            <p className="text-muted-foreground font-medium">Affinez vos filtres ou importez de nouveaux profils.</p>
          </div>
        )}
      </div>
    </div>
  )
}
