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
    return `• ${event.title} (${start} → ${end})`
  }).join('\n')
}

export async function POST(req: Request) {
  const { events, userPrompt } = await req.json()

  const prompt = `
You are an intelligent scheduling assistant.

Here is the user's current schedule:
${formatEvents(events)}

The user says: "${userPrompt}"

Now respond ONLY with a JSON array of new events to be added.
Each event must follow this schema exactly:

[
  {
    "title": "string",
    "start": "YYYY-MM-DDTHH:mm (ISO 8601 UTC time)",
    "end": "YYYY-MM-DDTHH:mm (ISO 8601 UTC time)",
    "type": "Work" | "Personal" | "Reminder",
    "priority": "Urgent" | "Normal"
  }
]

Do not include any explanation or markdown — return only the JSON.
If type or priority is unclear, default to "Personal" and "Normal".
Make sure start is before end.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
            role: 'system',
            content: `
            You are a smart scheduling assistant. 
            You receive a list of calendar events and a prompt from the user.

            You must always:
            - Respect all specific time constraints (e.g. "after 5pm", "before noon").
            - Avoid overlapping events.
            - Spread out repeated events over multiple days.
            - Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS) in 24-hour time.
            - Return a JSON array of new events only, like this:

            [
            {
                "title": "Workout",
                "start": "2025-07-03T17:30:00",
                "end": "2025-07-03T18:30:00",
                "type": "Personal",
                "priority": "Normal"
            },
            ...
            ]
            `
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
