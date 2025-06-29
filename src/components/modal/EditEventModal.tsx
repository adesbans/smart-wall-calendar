'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EventForm from '../EventForm'
import { CalendarEvent } from '@/lib/calendarEvent'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  onSave: (updatedEvent: CalendarEvent) => void
}

export default function EditEventModal({ open, onOpenChange, event, onSave }: Props) {
  if (!event) return null

  const handleUpdate = (data: Omit<CalendarEvent, 'id'>) => {
    onSave({ ...event, ...data }) // retain original ID
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EventForm
          initialData={event}
          onSubmit={handleUpdate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
