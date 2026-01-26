import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Pastikan kamu sudah pasang SUPABASE_SERVICE_ROLE_KEY di .env.local laptop kamu!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userId, targetId, newStatus } = body

    // 1. CEK KEAMANAN: Pastikan yang request adalah ADMIN
    const { data: requester } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (!requester || !requester.is_admin) {
      return NextResponse.json({ error: 'ANDA BUKAN ADMIN!' }, { status: 403 })
    }

    // --- MODE 1: AMBIL DATA USER ---
    if (action === 'fetch_users') {
      const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, subscription_status, trial_ends_at, store_name, store_phone, is_active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ users })
    }

    // --- MODE 2: UBAH STATUS ---
    if (action === 'update_status') {
      let updateData: any = { subscription_status: newStatus }
      
      // Tambah waktu expired
      if (newStatus === 'premium') {
        const nextMonth = new Date()
        nextMonth.setDate(nextMonth.getDate() + 30)
        updateData.trial_ends_at = nextMonth.toISOString()
      } else if (newStatus === 'trial') {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        updateData.trial_ends_at = nextWeek.toISOString()
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', targetId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}