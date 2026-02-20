import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteEvent } from '@/app/admin/actions'
import { EventCreationForm } from '@/components/features/events/EventCreationForm'
import { EventEditDialog } from '@/components/features/events/EventEditDialog'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft } from 'lucide-react'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-12">
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group font-bold"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour au tableau de bord
      </Link>

      <h1 className="text-3xl font-bold mb-8 italic uppercase">Gestion des Événements</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="pt-6">
              <CardTitle>Organiser un événement</CardTitle>
            </CardHeader>
            <CardContent>
              <EventCreationForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pt-6">
              <CardTitle>Événements programmés ({events?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <Link 
                        href={`/events/${event.id}`} 
                        className="font-bold hover:underline flex items-center gap-2 group"
                      >
                        {event.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <EventEditDialog event={event} />
                      <form action={deleteEvent.bind(null, event.id)}>
                        <Button variant="destructive" size="sm">Annuler</Button>
                      </form>
                    </div>
                  </div>
                ))}
                {events?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun événement programmé.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
