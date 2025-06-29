'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarEvent } from '@/lib/calendarEvent'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  onEditClick: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
}

export default function EventDetailsModal({
  open,
  onOpenChange,
  event,
  onEditClick,
  onDelete,
}: Props) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p><strong>Start:</strong> {event.start.toLocaleString()}</p>
          <p><strong>End:</strong> {event.end.toLocaleString()}</p>
          {event.location && <p><strong>Location:</strong> {event.location}</p>}
          {event.type && <p><strong>Type:</strong> {event.type}</p>}
          {event.priority && <p><strong>Priority:</strong> {event.priority}</p>}
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={() => onDelete(event)}>
            Delete
          </Button>
          <Button onClick={() => onEditClick(event)}>
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
