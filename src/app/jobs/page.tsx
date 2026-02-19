import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { FilterSelect } from '@/components/ui/filter-select'
import { Briefcase, MapPin, Clock, ExternalLink } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold italic uppercase mb-2">Offres d'emploi</h1>
          <p className="text-muted-foreground text-lg">Découvrez les opportunités du réseau MDS.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Suspense fallback={<div className="w-64 h-10 bg-muted animate-pulse rounded-md" />}>
            <SearchInput placeholder="Poste, entreprise..." />
          </Suspense>
          
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
              <Button variant="ghost">Effacer</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6">
        {jobs?.map((job) => (
          <Card key={job.id} className="group hover:border-primary transition-all">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-lg font-medium text-foreground">
                  {job.company}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                  {job.type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Posté le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 line-clamp-2">
                {job.description}
              </p>

              {job.link && (
                <Button asChild>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Postuler <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {jobs?.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Aucune offre disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
