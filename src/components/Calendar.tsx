'use client'

import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarEvent } from '@/lib/calendarEvent'

type CalendarViewProps = {
  events: CalendarEvent[]
  onDoubleClickEvent: (event: CalendarEvent) => void
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
})

export default function CalendarView({ events, onDoubleClickEvent }: CalendarViewProps) {
  const [defaultView, setDefaultView] = useState<View>('week')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDefaultView('day')
    }
  }, [])

  return (
    <div className="h-[90vh] w-full p-2 sm:p-4 text-black overflow-y-auto">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        views={['day', 'week', 'month']}
        style={{ height: '100%' }}
        onDoubleClickEvent={onDoubleClickEvent}
      />
    </div>
  )
}
