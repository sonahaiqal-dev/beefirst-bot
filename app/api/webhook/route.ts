import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Pakai Service Role Key (Wajib ada di Environment Variables Vercel)
// Kalau tidak ada, fallback ke Anon key (tapi berisiko kena RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sender, message, device } = body
    
    // --- DEBUGGING LOGS (Cek Log Vercel nanti) ---
    console.log("=================================")
    console.log("PESAN MASUK DARI:", sender)
    console.log("URL REQUEST:", request.url)
    console.log("DEVICE DARI BODY:", device)
    
    // 1. CARI TOKEN (Prioritas: URL -> Body)
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token')
    
    if (token) {
        console.log("✅ Token ditemukan di URL:", token)
    } else {
        console.log("⚠️ Token tidak ada di URL. Menggunakan Device Body:", device)
        token = device
    }

    // 2. CEK DATABASE
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    if (error) {
        console.log("❌ Error Query Database:", error.message)
    }

    if (!userProfile) {
      console.log(`❌ GAGAL: Token '${token}' tidak ada di tabel profiles.`)
      return NextResponse.json({ status: 'unknown_device' })
    }

    console.log("✅ USER DITEMUKAN:", userProfile.email)

    // 3. CEK MASA AKTIF
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        console.log('⛔ Masa Trial Habis.')
        // Kirim info trial habis
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: sender,
                message: "Trial Bot Habis. Hubungi Owner."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // 4. BALAS PESAN
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // Balasan
    const replyMessage = `Halo bos! 👋\nBot berhasil nyambung.\nAkun: ${userProfile.email}\nStatus: ${userProfile.subscription_status}`

    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: sender,
        message: replyMessage
      })
    })

    console.log('✅ SUKSES: Balasan terkirim ke', sender)
    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('CRITICAL ERROR:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Mode Detektif Siap 🕵️‍♂️' })
}