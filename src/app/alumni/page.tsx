import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SyncAlumniButton } from '@/components/features/sync-button'
import { Search, GraduationCap, Calendar, Linkedin, Mail, X, CheckCircle, AlertCircle } from 'lucide-react'
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
    .order('updated_at', { ascending: false })

  if (query) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
  }

  if (year) {
    supabaseQuery = supabaseQuery.eq('grad_year', parseInt(year))
  }

  const { data: alumni, error } = await supabaseQuery

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header / Hero Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                Réseau <span className="text-blue-600">Alumni</span>
              </h1>
              <p className="text-slate-500 font-medium">
                {alumni?.length || 0} membres connectés au réseau MyDigitalSchool
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                <form action="">
                  <Input 
                    name="query" 
                    placeholder="Nom, prénom..." 
                    defaultValue={query}
                    className="pl-10 bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-500 shadow-inner"
                  />
                </form>
              </div>
              <div className="relative w-full sm:w-32">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <form action="">
                  <Input 
                    name="year" 
                    type="number"
                    placeholder="Année" 
                    defaultValue={year}
                    className="pl-10 bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-500 shadow-inner"
                  />
                </form>
              </div>
              <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                Filtrer
              </Button>
              {(query || year) && (
                <Link href="/alumni">
                  <Button variant="ghost" className="h-12 w-12 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                    <X className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10">
        {error ? (
          <div className="p-8 bg-white rounded-3xl border-2 border-red-100 text-center shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Erreur de synchronisation</h3>
            <p className="text-slate-500">Impossible de charger les données de la base.</p>
          </div>
        ) : alumni && alumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {alumni.map((profile) => {
              const isVerified = profile.degree && profile.degree !== 'Importé via Excel' && profile.degree !== 'Parcours non trouvé';
              const isNotFound = profile.degree === 'Parcours non trouvé';

              return (
                <Card key={profile.id} className="group relative bg-white border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col">
                  {/* Banner / Status */}
                  <div className={`h-20 transition-colors duration-500 ${isVerified ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : isNotFound ? 'bg-slate-400' : 'bg-slate-200'}`}>
                    {isVerified && (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle className="h-3 w-3" />
                        Vérifié
                      </div>
                    )}
                    {isNotFound && (
                      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        <X className="h-3 w-3" />
                        Inconnu
                      </div>
                    )}
                  </div>
                  
                  <div className="px-6 pb-6 flex-1 flex flex-col">
                    {/* Avatar */}
                    <div className="relative -mt-10 mb-4 self-start">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white p-1 shadow-xl ring-1 ring-slate-100">
                        {profile.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.first_name}
                            className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-black text-2xl uppercase">
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 flex-1">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {profile.first_name} {profile.last_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            MyDigitalSchool
                          </span>
                          {profile.grad_year && !isNotFound && (
                            <span className="text-slate-400 text-xs font-bold">
                              • Promo {profile.grad_year}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 py-2">
                        {profile.degree && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className={`h-4 w-4 mt-0.5 shrink-0 ${isNotFound ? 'text-slate-400' : 'text-blue-500'}`} />
                            <p className={`text-sm font-medium leading-snug line-clamp-2 ${isNotFound ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                              {profile.degree}
                            </p>
                          </div>
                        )}
                        {profile.entry_year && !isNotFound && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
                              Cursus : {profile.entry_year} — {profile.grad_year || '?'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-auto flex items-center gap-2">
                      {profile.linkedin_url && (
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 h-11 rounded-2xl bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
                        >
                          <Linkedin className="h-4 w-4" />
                          PROFIL
                        </a>
                      )}
                      {profile.email && (
                        <a 
                          href={`mailto:${profile.email}`} 
                          className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 shadow-sm"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <Search className="h-16 w-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 uppercase italic">Aucun membre trouvé</h3>
            <p className="text-slate-500 mt-2">Essayez d'importer un fichier Excel ou lancez un scan LinkedIn.</p>
            {(query || year) && (
              <Button variant="link" asChild className="mt-4 text-blue-600 font-bold">
                <Link href="/alumni">Réinitialiser la recherche</Link>
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
