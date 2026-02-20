'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  location: string
  type: string
}

export function EventCalendar({ events }: { events: Event[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const totalDays = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)
  
  // Adjusted for Monday start if needed, but let's stick to Sunday start for simplicity or adjust to Monday
  // In France, week starts on Monday. Sunday is index 0 in JS.
  // 0: Dim, 1: Lun, 2: Mar, 3: Mer, 4: Jeu, 5: Ven, 6: Sam
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1

  const days = []
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const getEventsForDay = (day: number) => {
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return events.filter(e => e.date === dateString)
  }

  return (
    <div className="bg-background border-2 rounded-3xl overflow-hidden shadow-xl animate-in fade-in duration-700">
      {/* Calendar Header */}
      <div className="p-6 border-b bg-primary flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6" />
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{monthName}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-[120px] md:auto-rows-[160px]">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="border-r border-b bg-muted/10" />
          
          const dayEvents = getEventsForDay(day)
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

          return (
            <div key={day} className={cn(
              "border-r border-b p-2 relative group transition-colors hover:bg-primary/5",
              isToday && "bg-primary/5"
            )}>
              <span className={cn(
                "text-sm font-black italic",
                isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {day}
              </span>
              
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] scrollbar-none">
                {dayEvents.map(event => (
                  <Link 
                    key={event.id} 
                    href={`/events/${event.id}`}
                    className="block p-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all text-left"
                  >
                    <p className="text-[10px] font-black leading-tight line-clamp-2 uppercase italic tracking-tighter">
                      {event.title}
                    </p>
                    <div className="hidden md:flex items-center gap-1 mt-1 text-[8px] font-bold opacity-80">
                      <Clock className="h-2 w-2" /> {event.start_time.substring(0, 5)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
