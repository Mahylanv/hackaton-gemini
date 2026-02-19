import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar, MapPin, Clock, Tag } from 'lucide-react'

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold italic uppercase mb-2">Agenda des Événements</h1>
        <p className="text-muted-foreground text-lg">Retrouvez les prochains rendez-vous du réseau MDS.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {events?.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:border-primary transition-all border-2">
            <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
              <span className="flex items-center gap-2 font-bold text-primary">
                <Calendar className="h-4 w-4" />
                {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="px-2 py-1 rounded bg-background text-xs font-bold uppercase border">
                {event.type}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {event.description}
              </p>
            </CardContent>
          </Card>
        ))}

        {events?.length === 0 && (
          <div className="md:col-span-2 text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Aucun événement prévu pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
