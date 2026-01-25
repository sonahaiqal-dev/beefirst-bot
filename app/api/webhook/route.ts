import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Kita inisialisasi Supabase manual disini (bukan pake @/lib/supabaseClient)
// Karena API route butuh akses server-side yang lebih strict
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Pakai kunci master biar bisa tembus RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    // 1. Tangkap Data dari Fonnte
    const body = await request.json()
    
    // Data penting dari Fonnte:
    // body.device = Token Fonnte (Identitas User SaaS kita)
    // body.sender = Nomor HP pengirim pesan (Customer)
    // body.message = Isi pesan WA
    const { device, sender, message } = body

    console.log(`📩 Pesan masuk dari ${sender} ke Device: ${device}`)

    // 2. CEK PEMILIK TOKEN DI DATABASE
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', device)
      .single()

    // Kalau token tidak dikenali / tidak ada di database kita
    if (!userProfile || error) {
      console.log('❌ Token tidak terdaftar di sistem SaaS kita.')
      return NextResponse.json({ status: 'unknown_device' })
    }

    // 3. CEK MASA AKTIF (TRIAL / SUBSCRIPTION)
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        console.log('⛔ Masa Trial Habis. Bot Mogok.')
        // Opsional: Kirim pesan ke Owner kalau trial habis (Nanti aja fiturnya)
        return NextResponse.json({ status: 'trial_expired' })
    }

    // 4. LOGIC BALAS PESAN (SEMENTARA STATIS DULU)
    // Nanti disini kita pasang AI Groq. Sekarang tes koneksi dulu.
    
    // Jangan balas kalau pesannya dari status/broadcast sendiri (biar ga looping)
    if (sender === 'status' || message === '') return NextResponse.json({ status: 'ignored' })

    const replyMessage = `Halo! 👋\nBot BeeFirst berhasil connect!\n\nStatus Akun: ${userProfile.subscription_status}\nExpired: ${new Date(userProfile.trial_ends_at).toLocaleDateString()}`

    // Panggil API Fonnte buat Mengirim Balasan
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: device, // Pakai token user sendiri
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: sender,
        message: replyMessage
      })
    })

    console.log('✅ Balasan terkirim!')
    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('Error Webhook:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

// Fonnte kadang nge-ping pake GET buat validasi
export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Webhook Ready 🚀' })
}