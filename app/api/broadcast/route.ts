import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, target, message } = body // Target cuma 1 nomor sekarang

    if (!token || !target || !message) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Kirim ke Fonnte (Delay 1 detik cukup, karena Dashboard sudah kasih jeda)
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: target,
        message: message,
        delay: '1', 
      })
    })

    const result = await res.json()
    return NextResponse.json(result)

  } catch (err) {
    return NextResponse.json({ error: 'Gagal kirim broadcast' }, { status: 500 })
  }
}