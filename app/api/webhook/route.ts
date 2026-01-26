import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// --- 1. SETUP KONEKSI ---

// Supabase (Pakai Service Role Key biar bisa baca database tanpa login)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Groq AI (Pastikan API Key sudah ada di Vercel)
// Tambah || "" biar gak error saat build kalau env belum kebaca
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

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
                message: "Mohon maaf, masa trial Bot BeeFirst Anda sudah habis. Silakan hubungi owner untuk upgrade ke Premium."
            })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // --- 4. FILTER PESAN ---
    
    // Jangan balas status WA sendiri atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 5. LOGIKA AI PINTAR (KNOWLEDGE BASE) ---

    console.log(`🧠 AI memproses pesan dari ${sender}...`)

    // A. Ambil Data Kepribadian & Pengetahuan dari Database
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah dan membantu."
    
    // Ambil 3 Kolom Data Toko (Default kosong jika user belum isi)
    const productData = userProfile.kb_products || "Belum ada informasi produk."
    const hoursData = userProfile.kb_hours || "Belum ada informasi jam buka."
    const faqData = userProfile.kb_faq || "Belum ada informasi tambahan."

    // B. Gabungkan Data Jadi Satu Teks Rapi
    const knowledgeContext = `
    === DAFTAR PRODUK & HARGA ===
    ${productData}

    === JAM OPERASIONAL ===
    ${hoursData}

    === INFORMASI LAINNYA (FAQ/LOKASI/WIFI) ===
    ${faqData}
    `

    // C. Rakit Prompt Final untuk AI
    const finalSystemPrompt = `
      PERAN & KEPRIBADIAN:
      ${customPrompt}

      DATA FAKTA TOKO (SUMBER KEBENARAN UTAMA):
      Gunakan data di bawah ini untuk menjawab pertanyaan pelanggan.
      
      ATURAN PENTING:
      1. Jika user tanya harga/produk, LIHAT DATA PRODUK. Jangan ngarang harga sendiri.
      2. Jika user tanya jam buka, LIHAT DATA JAM OPERASIONAL.
      3. Jika informasi tidak ada di data ini, jawab jujur: "Mohon maaf, untuk info tersebut saya belum tau. Silakan hubungi admin langsung ya."
      4. Jawablah dengan singkat, ramah, dan to-the-point.

      === MULAI DATA TOKO ===
      ${knowledgeContext}
      === AKHIR DATA TOKO ===
    `

    // D. Panggil Groq AI (Model Terbaru)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile", // Model paling pinter & cepat
      temperature: 0.5, // 0.5 artinya seimbang (kreatif tapi patuh data)
      max_tokens: 600,
    })

    // Ambil jawaban dari AI
    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, AI sedang gangguan sebentar. Coba lagi nanti."

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

// Endpoint GET buat cek status server
export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Knowledge Brain Ready 🧠📚' })
}