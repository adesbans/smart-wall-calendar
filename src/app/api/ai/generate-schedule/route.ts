import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { CalendarEvent } from '@/lib/calendarEvent'
import { DateTime } from 'luxon'

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

  const easternNow = DateTime.now().setZone('America/New_York')
  const easternDateOnly = easternNow.toFormat('yyyy-MM-dd')
  const easternISO = easternNow.toISO()

  const systemPrompt = `
You are a smart and reliable personal scheduling assistant.

The user is in the Eastern Time Zone (America/New_York).
Your ONLY job is to respond with a raw JSON array of changes to the calendar.
Never explain, never introduce the response, and never wrap it in markdown.

Rules:
- Only output changed events — do not repeat unchanged ones.
- Valid actions: "add", "update", "delete"
- Always use ISO 8601 UTC datetime (YYYY-MM-DDTHH:mm:ss)
- Do NOT overlap events.
- Avoid scheduling between 10pm–7am unless the user says so.
- Use full object structure for "update" actions
- Return an empty array [] if no changes are needed

Time Window Interpretation:
- "Morning" → strictly 08:00–11:00 ET — prefer the earliest available time (08:00) unless taken
- "Afternoon" → 12:00–16:00 ET
- "Evening" → 17:00–21:00 ET

Date Understanding:
- Interpret "today", "tomorrow", and "next week" using the user's local date (${easternDateOnly})
- "Tomorrow" means the day after ${easternDateOnly} in Eastern Time
- Convert all local times to UTC before outputting
  `.trim()

  const userMessage = `
Current local time (Eastern): ${easternISO}
Today is: ${easternDateOnly}

Here is the user's current calendar:
${formatEvents(events)}

The user says: "${userPrompt}"
  `.trim()

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })

    const result = response.choices[0].message?.content
    return NextResponse.json({ result })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to generate schedule.' }, { status: 500 })
  }
}
