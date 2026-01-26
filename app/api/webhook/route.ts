import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

// 1. Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Setup Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sender, message, device } = body
    
    // --- VALIDASI TOKEN & USER (Sama kayak tadi) ---
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token') || device

    // Cek Database
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    if (!userProfile) return NextResponse.json({ status: 'unknown_device' })

    // Cek Masa Aktif
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)
    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        // Kalau habis, kirim pesan expired
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: sender, message: "Masa trial habis. Upgrade dulu bos!" })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    // Jangan balas status sendiri atau pesan kosong
    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 🤖 BAGIAN OTAK AI DIMULAI DISINI --- ---

    console.log(`🤖 AI Sedang berpikir untuk pesan: "${message}"`)

    // 1. Tentukan Kepribadian Bot (System Prompt)
    const systemPrompt = `
      Kamu adalah BeeFirst Assistant, asisten AI yang cerdas, ramah, dan jago jualan.
      Kamu bekerja untuk user pemilik bisnis ini.
      Gunakan Bahasa Indonesia yang luwes dan sopan.
      Jawablah pertanyaan user dengan singkat, padat, dan membantu.
      Jangan terlalu bertele-tele.
    `

    // 2. Kirim ke Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama3-8b-8192", // Model cepat & pintar
      temperature: 0.7,
    })

    // 3. Ambil Jawaban AI
    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, saya sedang pusing. Coba lagi ya."

    // --- KIRIM BALASAN KE WHATSAPP ---
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: sender,
        message: aiResponse // Kirim hasil mikir AI
      })
    })

    console.log('✅ AI Berhasil membalas!')
    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('ERROR:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BeeFirst AI Ready 🧠' })
}