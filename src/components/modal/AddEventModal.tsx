'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EventForm from '../EventForm'
import { CalendarEvent } from '@/lib/calendarEvent'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void
}

export default function AddEventModal({ open, onOpenChange, onAddEvent }: Props) {
  const handleSubmit = (event: Omit<CalendarEvent, 'id'>) => {
    onAddEvent(event)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
