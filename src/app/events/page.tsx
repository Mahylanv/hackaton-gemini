import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.query as string || ''
  
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events?.map((event) => {
            const interestedCount = event.event_interests?.[0]?.count || 0;
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
                  <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm">
                        <span className="text-xs font-black uppercase leading-none">{new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        <span className="text-xl font-black leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{event.type}</p>
                        <p className="text-sm font-black italic uppercase tracking-tighter">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">{interestedCount} 👍</span>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-6 py-4">

                  <CardTitle className="text-xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <div className="space-y-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {event.start_time.substring(0, 5)} — {event.end_time.substring(0, 5)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {event.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}

          {events?.length === 0 && (
            <div className="md:col-span-3 text-center py-24 bg-background border-2 border-dashed rounded-3xl">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">Aucun événement prévu.</p>
              <p className="text-muted-foreground mt-1">Revenez bientôt pour de nouvelles dates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
