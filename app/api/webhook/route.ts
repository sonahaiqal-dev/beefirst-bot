import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// --- 1. SETUP KONEKSI ---

// Supabase (Pakai Service Role Key biar bisa baca database tanpa login)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Groq AI (Pastikan API Key sudah ada di Vercel)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    // Tangkap data dari Fonnte
    const body = await request.json()
    const { sender, message, device } = body
    
    // --- 2. CEK IDENTITAS (TOKEN) ---
    
    // Prioritas: Ambil token dari URL dulu (settingan baru), kalau gak ada ambil dari body device
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token') || device

    console.log(`📩 Pesan dari ${sender}. Token: ${token}`)

    // Cek Pemilik Token di Database
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    // Kalau token tidak dikenal
    if (!userProfile) {
      console.log(`❌ Token ${token} tidak ditemukan.`)
      return NextResponse.json({ status: 'unknown_device' })
    }

    // --- 3. CEK MASA AKTIF TRIAL ---
    
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    // Kalau trial habis
    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        console.log('⛔ Masa Trial Habis.')
        // Kirim notifikasi trial habis ke user
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: sender,
                message: "Mohon maaf, masa trial Bot BeeFirst Anda sudah habis. Silakan hubungi owner untuk upgrade ke Premium."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN ---
    
    // Jangan balas status WA sendiri atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. OTAK AI (GROQ) BERPIKIR ---

    console.log(`🧠 AI sedang memproses pesan: "${message}"`)

    // Setting Kepribadian Bot
    const systemPrompt = `
      Kamu adalah BeeFirst Assistant, Customer Service AI yang ramah dan profesional.
      Tugasmu adalah membantu pelanggan dengan jawaban yang singkat, jelas, dan menggunakan Bahasa Indonesia yang santai tapi sopan.
      Jika ditanya hal yang tidak kamu tahu, jawab jujur dan tawarkan untuk menghubungi admin manusia.
    `

    // Panggil AI (Pakai Model Terbaru: Llama 3.3 70B)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      // INI YANG KITA UPDATE BIAR GAK ERROR:
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // 0.7 artinya kreatif tapi tetap nyambung
      max_tokens: 500,  // Batasi panjang jawaban biar gak kepotong
    })

    // Ambil jawaban dari AI
    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, AI sedang sibuk. Coba tanya lagi ya."

    // --- 6. KIRIM BALASAN KE WHATSAPP ---
    
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token!, // Pakai token user yang valid
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: sender,
        message: aiResponse // Kirim hasil pemikiran AI
      })
    })

    console.log('✅ Balasan AI terkirim sukses!')
    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('CRITICAL ERROR:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

// Endpoint GET buat ngecek status aja
export async function GET() {
  return NextResponse.json({ status: 'BeeFirst AI Brain Ready 🧠' })
}