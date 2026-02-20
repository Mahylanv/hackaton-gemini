import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Clock, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { InterestedButton } from '@/components/features/events/InterestedButton'
import { ShareButton } from '@/components/features/events/ShareButton'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // Récupérer le nombre total d'intéressés
  const { count: interestedCount } = await supabase
    .from('event_interests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  // Vérifier si l'utilisateur actuel est intéressé
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userInterest } = user 
    ? await supabase
        .from('event_interests')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const eventDate = new Date(event.date)

  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-pro-max py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group font-bold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour aux événements
        </Link>

        <article className="space-y-12">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest">
                <Tag className="h-3.5 w-3.5" /> {event.type}
              </span>
              <span className="text-muted-foreground font-black italic uppercase tracking-tighter">
                {formattedDate}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
              {event.title}
            </h1>

            <div className="grid sm:grid-cols-2 gap-6 pt-8 border-t-4 border-foreground">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Clock className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horaires</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter">
                    {event.start_time.substring(0, 5)} — {event.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lieu</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter">{event.location}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {event.image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(45,184,197,0.3)]">
                  <Image 
                    src={event.image_url} 
                    alt={event.title} 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="p-8 bg-muted/50 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                <p className="text-base leading-relaxed font-medium text-foreground/90 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="p-8 bg-background border-4 border-foreground rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
                <InterestedButton 
                  eventId={event.id} 
                  initialCount={interestedCount || 0} 
                  hasInterestsAlready={!!userInterest} 
                />
                <ShareButton title={event.title} />
              </div>

              <div className="p-8 bg-primary/5 rounded-3xl border-2 border-primary/20">
                <h3 className="font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> À savoir
                </h3>
                <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> <span>Ouvert à tous les alumni et étudiants.</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Inscription obligatoire pour l'accès.</span></li>
                  <li className="flex gap-2"><span>•</span> <span>Dress code décontracté.</span></li>
                </ul>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </div>
  )
}

