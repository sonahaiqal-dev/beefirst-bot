import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// --- 1. SETUP KONEKSI ---

// Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Groq AI (Handle jika key kosong biar build gak error)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

export async function POST(request: Request) {
  try {
    // Tangkap data dari Fonnte
    const body = await request.json()
    const { sender, message, device } = body
    
    // --- 2. CEK IDENTITAS (TOKEN) ---
    
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token') || device

    // Cek Pemilik Token di Database
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    // A. Kalau token tidak dikenal
    if (!userProfile) {
      console.log(`❌ Token ${token} tidak ditemukan di database.`)
      return NextResponse.json({ status: 'unknown_device' })
    }

    // B. CEK SAKLAR ON/OFF (FITUR BARU) 🔕
    // Jika user set is_active = false, bot tidur.
    if (userProfile.is_active === false) {
        console.log(`🔕 Bot dinonaktifkan oleh user ${userProfile.email}. Mengabaikan pesan.`)
        return NextResponse.json({ status: 'bot_disabled_by_user' })
    }

    // --- 3. CEK MASA AKTIF TRIAL ---
    
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        console.log('⛔ Masa Trial Habis.')
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: sender,
                message: "Masa trial Bot BeeFirst Anda sudah habis. Silakan hubungi owner untuk upgrade."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN ---
    
    // Jangan balas status WA atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. OTAK AI (KNOWLEDGE BASE) ---

    console.log(`🧠 AI memproses pesan dari ${sender}...`)

    // Ambil Data Profil & Knowledge Base
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah."
    
    const productData = userProfile.kb_products || "Belum ada info produk."
    const hoursData = userProfile.kb_hours || "Belum ada info jam buka."
    const faqData = userProfile.kb_faq || "Belum ada info tambahan."

    // Gabungkan Data
    const knowledgeContext = `
    === DAFTAR PRODUK & HARGA ===
    ${productData}

    === JAM OPERASIONAL ===
    ${hoursData}

    === INFO LAINNYA (FAQ/LOKASI) ===
    ${faqData}
    `

    // Rakit Prompt Final
    const finalSystemPrompt = `
      PERAN & IDENTITAS:
      ${customPrompt}

      DATA TOKO (SUMBER KEBENARAN):
      Gunakan data di bawah ini untuk menjawab user.
      1. Jika tanya harga/stok, WAJIB lihat data 'PRODUK & HARGA'. Jangan mengarang.
      2. Jika tanya buka jam berapa, lihat 'JAM OPERASIONAL'.
      3. Jika data tidak ada, jawab jujur bahwa kamu tidak tahu.

      === MULAI DATA ===
      ${knowledgeContext}
      === AKHIR DATA ===
    `

    // Panggil AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 600,
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, AI sedang sibuk."

    // --- 6. KIRIM BALASAN ---
    
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
  return NextResponse.json({ status: 'BeeFirst Ultimate Brain Ready 🧠✨' })
}
// Update pemancing vercel v1