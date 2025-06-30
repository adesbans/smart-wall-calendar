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
        scrollToTime={new Date(now.setHours(now.getHours() - 1, 0, 0, 0))}
        eventPropGetter={(event) => {
          let backgroundColor = '#E5E7EB' // default light gray
          let border = 'none'

          switch (event.type) {
            case 'Work':
              backgroundColor = '#BFDBFE' // soft blue-200
              break
            case 'Personal':
              backgroundColor = '#BBF7D0' // soft green-200
              break
            case 'Reminder':
              backgroundColor = '#FDE68A' // soft yellow-200
              break
          }

          if (event.priority === 'Urgent') {
            border = '2px solid #DC2626' // soft red border
          }

          return {
            style: {
              backgroundColor,
              color: '#1F2937', // soft black text
              border,
              borderRadius: '4px',
              paddingLeft: '4px',
              fontWeight: 400,
            },
          }
        }}
        components={{
          event: ({ event }) => (
            <div style={{ fontWeight: 400 }}>{event.title}</div>
          ),
        }}
      />
    </div>
  )
}
