import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { CalendarEvent } from '@/lib/calendarEvent'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function formatEvents(events: CalendarEvent[]) {
  return events.map((event) => {
    const start = new Date(event.start).toISOString()
    const end = new Date(event.end).toISOString()
    return `• [${event.id}] "${event.title}" from ${start} to ${end}`
  }).join('\n')
}

export async function POST(req: Request) {
  const { events, userPrompt } = await req.json()

  const prompt = `
  You are a smart and reliable personal scheduling assistant.

  You will receive:
  1. A list of the user's current calendar events.
  2. A prompt describing what changes they want made.

  Your task is to return a **JSON array of diffs** representing only the changes to be made. Each object in the array must have an "action" field with one of the following values:

  - "add": Add a new event
  - "update": Update an existing event (requires "id")
  - "delete": Delete an event (requires "id")

  ### STRICT RULES:
  - Only return the **changed events** — do NOT repeat unchanged ones.
  - Use ISO 8601 UTC format (YYYY-MM-DDTHH:mm:ss) for all date/time fields.
  - Do not overlap events.
  - For "update" actions, always include the full event object: id, title, start, end, type, and priority — even if only one field is changing.
  - Do not return partial updates.
  - If the prompt is vague, prefer placing events after 5pm.
  - Avoid personal events during working hours (9am–5pm) unless the user says so.
  - Spread recurring or similar events across different days.
  - If no changes are needed, return an empty array: []

  Here is the user's current calendar:
  ${formatEvents(events)}

  The user says: "${userPrompt}"

  ### RESPONSE FORMAT:

  Return ONLY a raw JSON array like this (NO explanation, no markdown, no preamble):

  [
    {
      "action": "add",
      "title": "Evening Workout",
      "start": "2025-07-03T17:30:00",
      "end": "2025-07-03T18:30:00",
      "type": "Personal",
      "priority": "Normal"
    },
    {
      "action": "update",
      "id": "abc123",
      "start": "2025-07-04T09:00:00",
      "end": "2025-07-04T10:00:00"
    },
    {
      "action": "delete",
      "id": "def456"
    }
  ]

  If the user’s request has already been satisfied or makes no changes, respond with: []
  DO NOT add any text outside the JSON array.
  `


  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
          You are a smart AI assistant for weekly calendar planning. 
          You help users update their schedules by suggesting new, modified, or removed events 
          based on the user's prompt and current calendar context. Your responses must always follow strict JSON formatting.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })

    const result = response.choices[0].message?.content
    return NextResponse.json({ result })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to generate schedule.' }, { status: 500 })
  }
}
