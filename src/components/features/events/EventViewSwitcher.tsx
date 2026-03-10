'use client'

import { useState } from 'react'
import { LayoutGrid, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCalendar } from './EventCalendar'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { MapPin, Clock, ArrowRight, ThumbsUp, Calendar } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  type: string
  image_url: string | null
  event_interests: { count: number }[]
}

export function EventViewSwitcher({ events }: { events: Event[] }) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid')

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-2xl border-2 border-border shadow-sm">
          <Button 
            variant={view === 'grid' ? 'default' : 'ghost'} 
            onClick={() => setView('grid')}
            className="rounded-xl font-black italic uppercase tracking-tighter gap-2"
          >
            <LayoutGrid className="h-4 w-4" /> Liste
          </Button>
          <Button 
            variant={view === 'calendar' ? 'default' : 'ghost'} 
            onClick={() => setView('calendar')}
            className="rounded-xl font-black italic uppercase tracking-tighter gap-2"
          >
            <CalendarIcon className="h-4 w-4" /> Calendrier
          </Button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const interestedCount = event.event_interests?.[0]?.count || 0;
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
                  <div className="relative h-48 w-full bg-primary/10 overflow-hidden">
                    {event.image_url ? (
                      <Image 
                        src={event.image_url} 
                        alt={event.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <Calendar className="h-20 w-20 text-primary" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg text-primary">
                        <span className="text-xs font-black uppercase leading-none">{new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        <span className="text-xl font-black leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary flex justify-between items-center text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{event.type}</p>
                        <p className="text-sm font-black italic uppercase tracking-tighter">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                        <ThumbsUp className="h-3.5 w-3.5 text-white fill-white/20" />
                        <span className="text-xs font-black">{interestedCount}</span>
                      </div>
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

          {events.length === 0 && (
            <div className="md:col-span-3 text-center py-24 bg-background border-2 border-dashed rounded-3xl">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">Aucun événement prévu.</p>
              <p className="text-muted-foreground mt-1">Revenez bientôt pour de nouvelles dates.</p>
            </div>
          )}
        </div>
      ) : (
        <EventCalendar events={events} />
      )}
    </div>
  )
}
