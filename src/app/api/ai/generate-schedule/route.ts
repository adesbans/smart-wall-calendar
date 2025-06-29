import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { CalendarEvent } from '@/lib/calendarEvent'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function formatEvents(events: CalendarEvent[]) {
  return events.map((event) => {
    return `${event.title}: ${event.start.toString()} → ${event.end.toString()}`
  }).join('\n')
}

export async function POST(req: Request) {
  const { events, userPrompt } = await req.json()

  const prompt = `
You are a helpful AI assistant that helps users schedule their week.

The user's current schedule is:
${formatEvents(events)}

The user says: "${userPrompt}"

Return an improved weekly schedule in bullet point format.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You help users plan their weekly schedule.' },
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
