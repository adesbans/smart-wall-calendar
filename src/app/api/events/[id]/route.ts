import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { error } = await supabase
    .from('events')
    .update(body)
    .eq('id', Number(params.id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('events').delete().eq('id', Number(params.id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
