import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userId, targetId, newStatus } = body

    // Cek Admin
    const { data: requester } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (!requester?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // --- MODE 1: FETCH DATA LENGKAP ---
    if (action === 'fetch_users') {
      const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('*') // Ambil semua data termasuk banned & tanggal
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ users })
    }

    // --- MODE 2: UPDATE STATUS LANGGANAN ---
    if (action === 'update_status') {
      let updateData: any = { subscription_status: newStatus }
      
      const now = new Date()
      if (newStatus === 'premium') {
        now.setDate(now.getDate() + 30) // Tambah 30 hari
        updateData.trial_ends_at = now.toISOString()
      } else {
        now.setDate(now.getDate() + 7) // Reset trial 7 hari
        updateData.trial_ends_at = now.toISOString()
      }

      const { error } = await supabaseAdmin.from('profiles').update(updateData).eq('id', targetId)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // --- MODE 3: FITUR BANNED (BARU) 🚫 ---
    if (action === 'toggle_ban') {
      // Cek dulu status sekarang
      const { data: current } = await supabaseAdmin.from('profiles').select('is_banned').eq('id', targetId).single()
      
      // Balik statusnya (kalau true jadi false, kalau false jadi true)
      const newBanStatus = !current?.is_banned

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_banned: newBanStatus })
        .eq('id', targetId)

      if (error) throw error
      return NextResponse.json({ success: true, is_banned: newBanStatus })
    }

    return NextResponse.json({ error: 'Action invalid' }, { status: 400 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}