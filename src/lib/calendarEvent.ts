export enum EventType {
    Work = "Work",
    Personal = "Personal",
    Reminder = "Reminder",
}

export enum EventPriority {
    Urgent = "Urgent",
    Normal = "Normal",
}

export type CalendarEvent = {
  id: number
  title: string
  start: Date
  end: Date
  allDay?: boolean
  type?: EventType
  priority?: EventPriority
  location?: string
}
