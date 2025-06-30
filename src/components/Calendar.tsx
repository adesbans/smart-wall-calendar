'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarEvent } from '@/lib/calendarEvent'
import { CSSProperties } from 'react'

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

// ✅ Force visibility of event title with padding and wrapping
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const style: CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '4px 6px',
    lineHeight: '1.2',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  }

  return <div style={style}>{event.title}</div>
}

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
        components={{
          event: EventComponent,
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#B0C4DE',
            border: '1px solidrgb(98, 248, 56)',
            color: '#023020',
            padding: '0',
          },
        })}
      />
    </div>
  )
}
