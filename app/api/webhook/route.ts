import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// --- 1. SETUP KONEKSI ---

// Pastikan Environment Variables sudah ada di Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Handle jika API Key kosong biar tidak crash saat build
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

export async function POST(request: Request) {
  try {
    // Tangkap data dari Fonnte
    const body = await request.json()
    const { sender, message, device } = body
    
    // --- 2. CEK IDENTITAS (TOKEN) ---
    const { searchParams } = new URL(request.url)
    // Token bisa dari URL (?token=...) atau dari body device
    let token = searchParams.get('token') || device

    // Cari User Pemilik Token di Database
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    // Jika token tidak ditemukan di database
    if (!userProfile) {
      console.log(`❌ Token ${token} tidak dikenal.`)
      return NextResponse.json({ status: 'unknown_device' })
    }

    // --- 3. SECURITY & STATUS CHECKS (URUTAN PENTING) ---

    // A. CEK STATUS BANNED (MANTRA ADMIN) 🚫
    // Kalau Admin sudah BAN user ini, bot langsung mati total.
    if (userProfile.is_banned) {
        console.log(`🚫 BLOCKED: User ${userProfile.email} status BANNED.`)
        return NextResponse.json({ status: 'banned_by_admin' })
    }

    // B. CEK SAKLAR ON/OFF (DASHBOARD USER) 🔕
    // Kalau user mematikan bot lewat dashboard.
    if (userProfile.is_active === false) {
        console.log(`🔕 SLEEP: User ${userProfile.email} mematikan botnya.`)
        return NextResponse.json({ status: 'bot_disabled_by_user' })
    }

    // C. CEK MASA AKTIF (TRIAL/PREMIUM) ⏳
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)

    // Jika sudah lewat tanggal expired DAN bukan akun Premium
    if (today > expiryDate && userProfile.subscription_status !== 'premium') {
        console.log('⛔ EXPIRED: Masa Trial Habis.')
        
        // (Opsional) Kirim pesan ke customer bahwa bot sedang off
        // await fetch('https://api.fonnte.com/send', {
        //     method: 'POST',
        //     headers: { Authorization: token!, 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         target: sender,
        //         message: "Mohon maaf, layanan asisten virtual toko kami sedang non-aktif sementara. Silakan tunggu balasan manual admin."
        //     })
        // })
        
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN ---
    // Jangan balas pesan status atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. OTAK AI (GROQ) ---

    console.log(`🧠 AI memproses pesan untuk toko: ${userProfile.store_name}...`)

    // Siapkan Data Knowledge Base
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah dan membantu."
    const productData = userProfile.kb_products || "Tidak ada informasi produk spesifik."
    const hoursData = userProfile.kb_hours || "Jam kerja standar (09.00 - 17.00)."
    const faqData = userProfile.kb_faq || "Tidak ada info tambahan."

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

      INSTRUKSI KHUSUS:
      1. Jawab HANYA berdasarkan "DATA TOKO" di bawah.
      2. Jangan mengarang harga atau stok jika tidak ada di data.
      3. Gunakan Bahasa Indonesia yang sopan, natural, dan persuasif.
      4. Jawab singkat dan padat (max 3-4 kalimat) agar nyaman dibaca di WhatsApp.

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

    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, saya sedang gangguan sebentar. Bisa ulangi?"

    // --- 6. KIRIM BALASAN KE CUSTOMER ---
    
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

    // --- 7. UPDATE STATISTIK (FITUR BARU) 📊 ---
    // Tambahkan +1 ke kolom total_chats di database
    const currentTotal = userProfile.total_chats || 0
    
    const { error: statsError } = await supabase
        .from('profiles')
        .update({ total_chats: currentTotal + 1 })
        .eq('id', userProfile.id)

    if (statsError) console.error("Gagal update statistik:", statsError.message)
    else console.log(`✅ Pesan Terkirim! Total Chat Toko Ini: ${currentTotal + 1}`)

    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('CRITICAL ERROR WEBHOOK:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Brain Online 🧠 v3.0 (Stats Enabled)' })
}