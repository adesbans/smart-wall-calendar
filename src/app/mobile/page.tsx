'use client'

import CalendarView from '@/components/Calendar'
import { CalendarEvent } from '@/lib/calendarEvent'
import AddEventModal from '@/components/modal/AddEventModal'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import EventDetailsModal from '@/components/modal/EventDetailsModal'
import EditEventModal from '@/components/modal/EditEventModal'

export default function MobilePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    })
    const created = await res.json()

    const normalized = {
      ...created,
      start: new Date(created.start),
      end: new Date(created.end),
    }

    setEvents((prev) => [...prev, normalized])
  }

  const handleDoubleClickEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  const handleEditClick = (event: CalendarEvent) => {
    setShowEditModal(true)
    setShowDetailsModal(false)
  }

  const handleSaveEdit = async (updated: CalendarEvent) => {
    await fetch(`/api/events/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setEvents((prev) => prev.map(e => e.id === updated.id ? updated : e))
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    setShowDetailsModal(false)
    setEvents((prev) => prev.filter((e) => e.id !== event.id))
  }

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch('/api/events')
      const data = await res.json()

      const normalizeEvent = (event: any): CalendarEvent => ({
        ...event,
        start: typeof event.start === 'string' ? new Date(event.start) : event.start,
        end: typeof event.end === 'string' ? new Date(event.end) : event.end,
      })

      setEvents(data.map(normalizeEvent))
    }
    fetchEvents()
  }, [])

  return (
    <main className="min-h-screen bg-white p-3 flex flex-col items-center">
      <h1 className="text-lg font-semibold mb-3">📱 Your Calendar</h1>

      <div className="w-full max-w-md shadow rounded-lg bg-white">
        <CalendarView 
          events={events}
          onDoubleClickEvent={handleDoubleClickEvent}
        />
      </div>

      <EventDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        event={selectedEvent}
        onEditClick={handleEditClick}
        onDelete={handleDeleteEvent}
      />

      <EditEventModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        event={selectedEvent}
        onSave={handleSaveEdit}
      />

      <div className="fixed bottom-4 right-4">
        <Button onClick={() => setShowModal(true)}>➕</Button>
      </div>

      <AddEventModal
        open={showModal}
        onOpenChange={setShowModal}
        onAddEvent={handleAddEvent}
      />
    </main>
  )
}
