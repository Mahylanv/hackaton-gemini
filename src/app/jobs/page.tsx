import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterSelect } from '@/components/ui/filter-select'
import { Briefcase, MapPin, Clock, ExternalLink, ArrowUpRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.query as string || ''
  const type = params.type as string || ''
  
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'
  }

  let supabaseQuery = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`)
  }

  if (type) {
    supabaseQuery = supabaseQuery.eq('type', type)
  }

  const { data: jobs } = await supabaseQuery

  return (
    <div className="min-h-screen bg-pro-max">
      <div className="container mx-auto px-4 py-12 relative">
        <header className="mb-12 space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5" /> Talents Board
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Offres d'emploi</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              Les meilleures opportunités professionnelles partagées par le réseau.
            </p>
          </div>

          <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row gap-3 items-center bg-background p-3 rounded-2xl border shadow-lg">
            <div className="flex-1 w-full">
              <Suspense fallback={<div className="w-full h-12 bg-muted animate-pulse rounded-xl" />}>
                <SearchInput placeholder="Poste, entreprise, mots-clés..." />
              </Suspense>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <FilterSelect 
                name="type"
                placeholder="Tous types"
                defaultValue={type}
                options={[
                  { label: 'CDI', value: 'CDI' },
                  { label: 'CDD', value: 'CDD' },
                  { label: 'Stage', value: 'STAGE' },
                  { label: 'Alternance', value: 'ALTERNANCE' },
                  { label: 'Freelance', value: 'FREELANCE' },
                ]}
              />

              {(query || type) && (
                <Link href="/jobs">
                  <Button variant="ghost" className="h-10 font-bold px-6">Effacer</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs?.map((job) => (
            <Card key={job.id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 border-2 flex flex-col">
              <CardHeader className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground">
                    {job.type}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                    <Clock className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </CardTitle>
                  <p className="font-bold text-sm text-foreground/80 mt-1">{job.company}</p>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {job.location}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>
                
                {job.link && (
                  <Button asChild className="w-full mt-6 rounded-xl font-bold shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all" size="sm">
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                      Postuler <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {jobs?.length === 0 && (
            <div className="md:col-span-3 text-center py-24 bg-background border-2 border-dashed rounded-3xl">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">Aucune offre disponible.</p>
              <p className="text-muted-foreground mt-1">Revenez plus tard pour de nouvelles opportunités.</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <Link 
          href="/admin/jobs" 
          className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in duration-500"
        >
          <Button size="lg" className="rounded-full h-16 px-8 shadow-2xl shadow-primary/40 font-black italic uppercase tracking-tighter gap-2 border-2 border-white/20 backdrop-blur-sm">
            <Plus className="h-6 w-6" />
            Publier une offre
          </Button>
        </Link>
      )}
    </div>
  )
}
