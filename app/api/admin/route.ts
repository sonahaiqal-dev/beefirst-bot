import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Setup Supabase dengan Service Role Key (Wajib untuk akses Admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userId, targetId, newStatus, token } = body

    // 1. Fetch Semua User
    if (action === 'fetch_users') {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return NextResponse.json({ users: profiles })
    }

    // 2. Update Status Langganan (Premium/Trial)
    if (action === 'update_status') {
      const updates: any = { subscription_status: newStatus }
      
      if (newStatus === 'premium') {
        const nextMonth = new Date()
        nextMonth.setDate(nextMonth.getDate() + 30)
        updates.trial_ends_at = nextMonth.toISOString()
      } else {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        updates.trial_ends_at = nextWeek.toISOString()
      }

      await supabase.from('profiles').update(updates).eq('id', targetId)
      return NextResponse.json({ success: true })
    }

    // 3. Toggle Banned
    if (action === 'toggle_ban') {
       const { data: user } = await supabase.from('profiles').select('is_banned').eq('id', targetId).single()
       await supabase.from('profiles').update({ is_banned: !user?.is_banned }).eq('id', targetId)
       return NextResponse.json({ success: true })
    }

    // 4. UPDATE TOKEN (LOGIKA BARU)
    if (action === 'update_token') {
        const { error } = await supabase
            .from('profiles')
            .update({ fonnte_token: token }) 
            .eq('id', targetId)
        
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err: any) {
    console.error("Admin API Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}