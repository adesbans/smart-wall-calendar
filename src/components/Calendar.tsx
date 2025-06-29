'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
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
  const now = new Date()

  return (
    <div className="h-[90vh] w-full p-4 text-black">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['day', 'week', 'month']}
        style={{ height: '100%' }}
        onDoubleClickEvent={onDoubleClickEvent}
        scrollToTime={new Date(now.setHours(now.getHours() - 1, 0, 0, 0))} // scroll to 1 hour before now
      />
    </div>
  )
}
