import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SyncAlumniButton } from '@/components/features/sync-button'
import { Search, GraduationCap, Calendar, Linkedin, Mail, MapPin, X } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
                Communauté MyDigitalSchool
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Annuaire des <span className="text-blue-600">Alumni</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                Retrouvez et connectez-vous avec les anciens étudiants de votre promotion et du réseau.
              </p>
            </div>
            <SyncAlumniButton />
          </div>

          {/* Search & Filters */}
          <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <form action="" className="w-full">
                <Input 
                  name="query" 
                  placeholder="Rechercher par nom ou prénom..." 
                  defaultValue={query}
                  className="pl-10 bg-white border-slate-200 h-11 w-full rounded-xl focus-visible:ring-blue-500"
                />
              </form>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative md:w-32 flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <form action="" className="w-full">
                  <Input 
                    name="year" 
                    type="number"
                    placeholder="Promo" 
                    defaultValue={year}
                    className="pl-10 bg-white border-slate-200 h-11 rounded-xl focus-visible:ring-blue-500"
                  />
                </form>
              </div>
              <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-200 transition-all">
                Filtrer
              </Button>
              {(query || year) && (
                <Link href="/alumni">
                  <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-red-100 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <X className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Erreur de chargement</h3>
            <p className="text-slate-500">Une erreur est survenue lors de la récupération des données.</p>
          </div>
        ) : alumni && alumni.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {alumni.map((profile) => (
              <Card key={profile.id} className="group relative bg-white border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                
                <div className="px-6 pb-8 pt-0 flex flex-col items-center -mt-12">
                  {/* Profile Image */}
                  <div className="relative mb-4 ring-4 ring-white rounded-2xl overflow-hidden shadow-md">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-24 h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-2xl uppercase tracking-tighter">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-1 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold text-sm">
                      <GraduationCap className="h-3 w-3" />
                      <span>Promotion {profile.grad_year || "2024"}</span>
                    </div>
                    <p className="text-slate-500 text-sm italic line-clamp-2 min-h-[2.5rem]">
                      {profile.degree}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 w-full border-t border-slate-100 pt-6">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                      >
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                      </a>
                    )}
                    {profile.email && (
                      <a 
                        href={`mailto:${profile.email}`} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-600 transition-all shadow-sm"
                        title={profile.email}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-slate-500 max-w-md">
              Nous n'avons trouvé aucun alumni correspondant à votre recherche. Essayez d'ajuster les filtres ou de synchroniser de nouvelles données.
            </p>
            {(query || year) && (
              <Link href="/alumni" className="mt-6">
                <Button variant="link" className="text-blue-600 font-bold">
                  Effacer tous les filtres
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
