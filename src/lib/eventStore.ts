import { CalendarEvent, EventPriority, EventType } from './calendarEvent'

class EventStore {
  private events: CalendarEvent[] = [
  {
    id: 1,
    title: 'Morning Workout',
    start: new Date(2025, 5, 29, 7, 0),
    end: new Date(2025, 5, 29, 8, 0),
    type: EventType.Personal,
  },
  {
    id: 2,
    title: 'Team Meeting',
    start: new Date(2025, 5, 29, 10, 30),
    end: new Date(2025, 5, 29, 11, 30),
    type: EventType.Work,
    location: 'Zoom',
    priority: EventPriority.Urgent
  },
  {
    id: 3,
    title: 'Lunch with Alex',
    start: new Date(2025, 5, 29, 12, 30),
    end: new Date(2025, 5, 29, 13, 30),
    type: EventType.Personal,
  },
  {
    id: 4,
    title: 'Code Review Block',
    start: new Date(2025, 5, 29, 14, 0),
    end: new Date(2025, 5, 29, 16, 0),
    type: EventType.Work,
  },
  {
    id: 5,
    title: 'Reminder: Submit timesheet',
    start: new Date(2025, 5, 29, 17, 0),
    end: new Date(2025, 5, 29, 17, 15),
    type: EventType.Reminder,
  },
]

  getAll(): CalendarEvent[] {
    return this.events
  }

  add(event: CalendarEvent) {
    this.events.push(event)
  }

  update(id: number, updated: Partial<CalendarEvent>) {
    const index = this.events.findIndex(e => e.id === id)
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updated }
    }
  }

  remove(id: number) {
    this.events = this.events.filter(e => e.id !== id)
  }
}

export const eventStore = new EventStore()
