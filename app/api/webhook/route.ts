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
    
    // Prioritas: Ambil token dari URL dulu, kalau gak ada ambil dari body device
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token') || device

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
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: sender,
                message: "Mohon maaf, masa trial Bot ini sudah habis. Silakan hubungi owner untuk perpanjang."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN ---
    
    // Jangan balas status WA sendiri atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. LOGIKA AI PINTAR (RAG LITE) ---

    console.log(`🧠 AI memproses pesan dari ${sender}...`)

    // Ambil Data dari Database
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah dan membantu."
    const knowledgeBase = userProfile.knowledge_base || "Belum ada data toko spesifik."

    // RAKIT PROMPT GABUNGAN
    // Ini rahasianya: Kita suruh AI baca Knowledge Base dulu sebelum jawab
    const finalSystemPrompt = `
      PERAN & KEPRIBADIAN:
      ${customPrompt}

      DATA PENGETAHUAN / FAKTA TOKO:
      Gunakan informasi di bawah ini sebagai sumber kebenaran utama untuk menjawab pertanyaan user.
      Jika pertanyaan user tidak ada jawabannya di data ini, jawab jujur bahwa kamu tidak tahu dan tawarkan untuk hubungi admin/owner.
      JANGAN MENGARANG DATA HARGA ATAU STOK YANG TIDAK ADA DISINI.

      === MULAI DATA ===
      ${knowledgeBase}
      === AKHIR DATA ===
    `

    // Panggil AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Kita set agak rendah biar dia patuh sama data (gak halu)
      max_tokens: 600,
    })

    // Ambil jawaban dari AI
    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, AI sedang gangguan sebentar."

    // --- 6. KIRIM BALASAN KE WHATSAPP ---
    
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token!, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: sender,
        message: aiResponse
      })
    })

    console.log('✅ Balasan AI terkirim!')
    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('CRITICAL ERROR:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Knowledge Brain Ready 🧠📚' })
}