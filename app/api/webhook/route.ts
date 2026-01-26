import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// --- 1. SETUP KONEKSI ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Jika token tidak dikenal
    if (!userProfile) {
      console.log(`❌ Token ${token} tidak ditemukan di database.`)
      return NextResponse.json({ status: 'unknown_device' })
    }

    // --- 3. SECURITY CHECKS (URUTAN PENTING) ---

    // A. CEK STATUS BANNED (MANTRA ADMIN) 🚫
    // Ini fitur baru. Kalau admin tekan BAN, bot langsung tolak proses.
    if (userProfile.is_banned) {
        console.log(`🚫 BLOCKED: User ${userProfile.email} sedang di-BANNED.`)
        return NextResponse.json({ status: 'banned_by_admin' })
    }

    // B. CEK SAKLAR ON/OFF (DASHBOARD USER) 🔕
    if (userProfile.is_active === false) {
        console.log(`🔕 SLEEP: User ${userProfile.email} mematikan botnya sendiri.`)
        return NextResponse.json({ status: 'bot_disabled_by_user' })
    }

    // C. CEK MASA AKTIF (TRIAL/PREMIUM) ⏳
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    // Logika: Kalau hari ini > expired DAN statusnya masih trial
    if (today > expiryDate && userProfile.subscription_status !== 'premium') {
        console.log('⛔ EXPIRED: Masa Trial Habis.')
        
        // Kirim pesan "Bayar Woi" ke customer (Opsional, bisa dihapus kalau gak mau nyepam)
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: sender,
                message: "Maaf, layanan Chatbot otomatis toko ini sedang non-aktif sementara (Masa Trial Habis). Silakan hubungi admin toko manual."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN SAMPAH ---
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. OTAK AI (GROQ) ---

    console.log(`🧠 AI memproses pesan untuk toko: ${userProfile.store_name}...`)

    // Siapkan Data Knowledge Base
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah."
    const productData = userProfile.kb_products || "Belum ada info produk."
    const hoursData = userProfile.kb_hours || "Belum ada info jam buka."
    const faqData = userProfile.kb_faq || "Belum ada info tambahan."

    // Gabungkan Data Context
    const knowledgeContext = `
    === DATA TOKO (SUMBER KEBENARAN) ===
    Nama Toko: ${userProfile.store_name}
    
    [DAFTAR PRODUK & HARGA]
    ${productData}

    [JAM OPERASIONAL]
    ${hoursData}

    [FAQ / INFO LAIN]
    ${faqData}
    `

    // Rakit Prompt Final
    const finalSystemPrompt = `
      PERAN:
      ${customPrompt}

      INSTRUKSI PENTING:
      1. Jawab berdasarkan data "DATA TOKO" di bawah.
      2. Jangan mengarang harga atau stok jika tidak ada di data.
      3. Gunakan Bahasa Indonesia yang sopan dan natural (seperti CS manusia).
      4. Jawab singkat, padat, dan membantu (max 3 kalimat jika memungkinkan).

      ${knowledgeContext}
    `

    // Panggil Groq AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 500,
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, saya sedang gangguan sebentar."

    // --- 6. KIRIM BALASAN KE WA ---
    
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
    console.error('CRITICAL ERROR WEBHOOK:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Brain Online 🧠 v2.0 (With Admin Control)' })
}