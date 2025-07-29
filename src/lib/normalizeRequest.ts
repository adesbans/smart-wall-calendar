import { DateTime } from 'luxon'

export type NormalizedRequest = {
  intent: 'add' | 'update' | 'delete'
  count?: number
  title?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  when?: string
  days?: string[]
}

export function normalizeRequest(input: string): NormalizedRequest {
  const text = input.toLowerCase()

  const intent: NormalizedRequest['intent'] =
    text.includes('delete') ? 'delete' :
    text.includes('update') || text.includes('move') ? 'update' :
    'add'

  const countMatch = text.match(/(?:one|two|three|four|five|\d+) (?:event|workout|meeting|task)s?/)
  const count = countMatch ? parseInt(countMatch[0]) || 1 : 1

  const titleMatch = text.match(/(workout|meeting|lunch|call|task)/)
  const title = titleMatch ? titleMatch[1] : 'Task'

  let timeOfDay: NormalizedRequest['timeOfDay']
  if (text.includes('morning')) timeOfDay = 'morning'
  else if (text.includes('afternoon')) timeOfDay = 'afternoon'
  else if (text.includes('evening') || text.includes('after work')) timeOfDay = 'evening'

  const days: string[] = []
  if (text.includes('weekday') || text.includes('work week')) {
    days.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
  }

  const now = DateTime.now().setZone('America/New_York')
  const when = text.includes('tomorrow')
    ? now.plus({ days: 1 }).toFormat('yyyy-MM-dd')
    : undefined

  return {
    intent,
    count,
    title,
    timeOfDay,
    when,
    days: days.length ? days : undefined
  }
}
