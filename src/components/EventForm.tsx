'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarEvent, EventPriority, EventType } from '@/lib/calendarEvent'

type Props = {
  initialData?: Partial<CalendarEvent>
  onSubmit: (data: Omit<CalendarEvent, 'id'>) => void
  onCancel?: () => void
}

// ✅ Converts a Date to a local ISO string (no Z, no seconds)
function toLocalISOString(date: Date): string {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export default function EventForm({ initialData = {}, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialData.title || '')
  const [start, setStart] = useState(
    initialData.start ? toLocalISOString(new Date(initialData.start)) : ''
  )
  const [end, setEnd] = useState(
    initialData.end ? toLocalISOString(new Date(initialData.end)) : ''
  )
  const [type, setType] = useState<EventType>(initialData.type || EventType.Personal)
  const [priority, setPriority] = useState<EventPriority>(initialData.priority || EventPriority.Normal)

  const handleSubmit = () => {
    if (!title || !start || !end) return
    onSubmit({
      title,
      start: new Date(start),
      end: new Date(end),
      type: type as EventType,
      priority: priority as EventPriority,
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <Input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as EventType)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select type</option>
        {Object.values(EventType).map((val) => (
          <option key={val} value={val}>{val}</option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as EventPriority)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select priority</option>
        {Object.values(EventPriority).map((val) => (
          <option key={val} value={val}>{val}</option>
        ))}
      </select>

      <Button onClick={handleSubmit} className="w-full">Save</Button>
      {onCancel && (
        <Button variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      )}
    </div>
  )
}
