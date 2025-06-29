import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase.from('events').select('*')

  if (error) {
    console.error('❌ Error fetching events:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  // Add fallback for optional fields
  const newEvent = {
    ...body,
    start: new Date(body.start).toISOString(),
    end: new Date(body.end).toISOString(),
    type: body.type || 'Personal',
    priority: body.priority || 'Normal',
  }

  const { data, error } = await supabase.from('events').insert([newEvent]).select().single()

  if (error) {
    console.error('Error creating event:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
