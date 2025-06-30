'use client'

import { useEffect, useState } from 'react'
import CalendarView from '@/components/Calendar'
import AddEventModal from '@/components/modal/AddEventModal'
import EventDetailsModal from '@/components/modal/EventDetailsModal'
import EditEventModal from '@/components/modal/EditEventModal'
import { CalendarEvent, EventPriority, EventType } from '@/lib/calendarEvent'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function HomePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

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

  const handleSmartSchedule = async () => {
  try {
    setLoadingAi(true)
    setAiResponse('')
    const res = await fetch('/api/ai/generate-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt: aiPrompt, events }),
    })
    const data = await res.json()
    console.log('AI raw response:', data)
    setLoadingAi(false)

    try {
      const diffs = JSON.parse(data.result)

      for (const change of diffs) {
        if (change.action === 'add') {
          const newEvent = {
            title: change.title,
            start: new Date(new Date(change.start).toLocaleString('en-US', { timeZone: 'America/New_York' })),
            end: new Date(new Date(change.end).toLocaleString('en-US', { timeZone: 'America/New_York' })),
            type: change.type || EventType.Personal,
            priority: change.priority || EventPriority.Normal,
          }

          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent),
          })
          const saved = await res.json()
          setEvents((prev) => [...prev, {
            ...saved,
            start: new Date(saved.start),
            end: new Date(saved.end),
          }])
        }

        if (change.action === 'update' && change.id) {
          const existing = events.find(e => e.id === change.id)
          if (!existing) continue

          const updated = {
            ...existing,
            start: new Date(change.start),
            end: new Date(change.end),
            title: change.title || existing.title,
            type: change.type || existing.type,
            priority: change.priority || existing.priority,
          }

          await fetch(`/api/events/${updated.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          })
          setEvents((prev) => prev.map(e => e.id === updated.id ? updated : e))
        }

        if (change.action === 'delete' && change.id) {
          await fetch(`/api/events/${change.id}`, { method: 'DELETE' })
          setEvents((prev) => prev.filter(e => e.id !== change.id))
        }
      }

      setAiResponse('✅ Schedule successfully updated.')
      setAiModalOpen(false)
      setAiPrompt('')
    } catch (e) {
      console.error('Failed to parse AI result:', e)
      setAiResponse('⚠️ Failed to parse AI response. Try again or tweak your prompt.')
    }
  } catch (err) {
    console.error('AI request failed:', err)
    setAiResponse('❌ Something went wrong. Please try again.')
    setLoadingAi(false)
  }
}

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl shadow-md rounded-xl overflow-hidden bg-white">
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

      <AddEventModal
        open={showModal}
        onOpenChange={setShowModal}
        onAddEvent={handleAddEvent}
      />

      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🧠 Smart Schedule Assistant</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="E.g. Add a workout on Thursday after 5pm and delete my 10am meeting."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={handleSmartSchedule}
            disabled={loadingAi || !aiPrompt.trim()}
          >
            {loadingAi ? 'Thinking...' : 'Generate & Apply Schedule'}
          </Button>

          {aiResponse && (
            <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700 border rounded p-3 bg-gray-100">
              {aiResponse}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Button onClick={() => setShowModal(true)}>➕ Add Event</Button>
        <Button
          onClick={() => setAiModalOpen(true)}
          className="bg-blue-100 hover:bg-blue-300 text-blue-800 font-semibold transition-colors"
        >
          🤖 Smart Schedule
        </Button>
      </div>
    </main>
  )
}
