import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { EventViewSwitcher } from '@/components/features/events/EventViewSwitcher'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.query as string || ''
  
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
    .from('events')
    .select('*, event_interests(count)')
    .order('date', { ascending: true })

  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,type.ilike.%${query}%`)
  }

  const { data: events } = await supabaseQuery

  return (
    <div className="min-h-screen bg-pro-max">
      <div className="container mx-auto px-4 py-12 relative">
        <header className="mb-12 space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" /> Agenda Réseau
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Événements</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              Conférences, afterworks et ateliers. Ne manquez aucun rendez-vous.
            </p>
          </div>

          <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row gap-3 items-center bg-background p-3 rounded-2xl border shadow-lg">
            <div className="flex-1 w-full">
              <Suspense fallback={<div className="w-full h-12 bg-muted animate-pulse rounded-xl" />}>
                <SearchInput placeholder="Rechercher par titre, lieu, type d'événement..." />
              </Suspense>
            </div>

            {query && (
              <Link href="/events" className="shrink-0">
                <Button variant="ghost" className="h-12 font-bold px-6">Effacer</Button>
              </Link>
            )}
          </div>
        </header>

        <EventViewSwitcher events={events || []} />
      </div>

      {isAdmin && (
        <Link 
          href="/admin/events" 
          className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in duration-500"
        >
          <Button size="lg" className="rounded-full h-16 px-8 shadow-2xl shadow-primary/40 font-black italic uppercase tracking-tighter gap-2 border-2 border-white/20 backdrop-blur-sm">
            <Plus className="h-6 w-6" />
            Créer un événement
          </Button>
        </Link>
      )}
    </div>
  )
}
