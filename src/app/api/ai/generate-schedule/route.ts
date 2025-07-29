import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { CalendarEvent } from '@/lib/calendarEvent'
import { DateTime } from 'luxon'
import { normalizeRequest } from '@/lib/normalizeRequest'

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

  const parsed = normalizeRequest(userPrompt)

  const systemPrompt = `
You are a smart and reliable scheduling assistant.

The user is in the Eastern Time Zone (America/New_York).
Use ISO 8601 UTC datetime format (YYYY-MM-DDTHH:mm:ss) for all fields.
Never return unchanged events. Never overlap events. Never schedule between 10pm–7am ET unless instructed.

Time ranges:
- "morning": 06:00–08:59
- "afternoon": 12:00–16:00
- "evening": 17:00–21:00
- Work hours are 09:00–17:00 ET Monday–Friday — avoid personal events then.

If a prompt says "tomorrow", use: ${easternDateOnly} + 1 day (Eastern Time).
If "work week" or weekdays are requested, use Monday–Friday of the current week starting from today (${easternDateOnly}).

Return ONLY a raw JSON array. No explanations, markdown, or preamble.
`.trim()

  const userMessage = `
Current local time (Eastern): ${easternISO}
User request: "${userPrompt}"

Parsed intent:
${JSON.stringify(parsed, null, 2)}

Current calendar:
${formatEvents(events)}
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
