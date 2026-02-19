import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SyncAlumniButton } from '@/components/features/sync-button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold italic uppercase">Annuaire Alumni</h1>
          <p className="text-muted-foreground">Retrouvez les anciens étudiants du réseau.</p>
        </div>

        <div className="flex flex-col gap-4">
          <SyncAlumniButton />
          <form className="flex flex-wrap gap-2 md:w-auto">
            <Input 
              name="query" 
              placeholder="Rechercher un nom..." 
              defaultValue={query}
              className="w-full md:w-64"
            />
            <Input 
              name="year" 
              type="number"
              placeholder="Année" 
              defaultValue={year}
              className="w-full md:w-24"
            />
            <Button type="submit">Filtrer</Button>
            {(query || year) && (
              <Link href="/alumni">
                <Button variant="ghost">Effacer</Button>
              </Link>
            )}
          </form>
        </div>
      </header>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          Une erreur est survenue lors de la récupération des données.
        </div>
      ) : alumni && alumni.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumni.map((profile) => (
            <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-muted relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <p className="text-sm font-medium text-primary">
                  {profile.degree} • {profile.grad_year}
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate italic">
                  {profile.email}
                </p>
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-linkedin"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Aucun alumni trouvé pour cette recherche.</p>
        </div>
      )}
    </div>
  )
}
