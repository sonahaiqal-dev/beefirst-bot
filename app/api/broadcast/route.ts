import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, target, message } = body

    if (!token || !target || !message) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Kirim ke Fonnte
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: target, // Bisa banyak nomor dipisah koma
        message: message,
        delay: '6', // Jeda 2 detik biar aman dari blokir
      })
    })

    const result = await res.json()
    return NextResponse.json(result)

  } catch (err) {
    return NextResponse.json({ error: 'Gagal kirim broadcast' }, { status: 500 })
  }
}