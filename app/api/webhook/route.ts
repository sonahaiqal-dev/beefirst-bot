import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sender, message, device } = body
    
    // 1. CARI TOKEN
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token') || device

    // 2. AMBIL PROFIL & PROMPT USER DARI DB
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fonnte_token', token)
      .single()

    if (!userProfile) return NextResponse.json({ status: 'unknown_device' })

    // Cek Trial
    const today = new Date()
    const expiryDate = new Date(userProfile.trial_ends_at)
    if (today > expiryDate && userProfile.subscription_status === 'trial') {
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token!, 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: sender, message: "Masa trial habis." })
        })
        return NextResponse.json({ status: 'trial_expired' })
    }

    if (sender === 'status' || !message) return NextResponse.json({ status: 'ignored' })

    // --- 3. AMBIL KEPRIBADIAN DARI DATABASE (DYNAMIC PROMPT) ---
    // Kalau user belum setting, pakai default
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah dan membantu."
    
    console.log(`🧠 AI Prompt untuk ${userProfile.email}: "${customPrompt}"`)

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        // Masukkan Prompt Customer disini:
        { role: "system", content: customPrompt }, 
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, AI error."

    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: sender, message: aiResponse })
    })

    return NextResponse.json({ status: 'success' })

  } catch (err) {
    console.error('ERROR:', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'BeeFirst Dynamic Brain Ready 🧠' })
}