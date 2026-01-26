'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Data
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [token, setToken] = useState('')
  const [isActive, setIsActive] = useState(true) 
  const [prompt, setPrompt] = useState('')
  const [totalChats, setTotalChats] = useState(0)
  const [products, setProducts] = useState('')
  const [hours, setHours] = useState('')
  const [faq, setFaq] = useState('')

  // Broadcast
  const [broadcastTarget, setBroadcastTarget] = useState('')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setStoreName(data.store_name || '')
        setStorePhone(data.store_phone || '')
        setToken(data.fonnte_token || '')
        setIsActive(data.is_active ?? true)
        setPrompt(data.system_prompt || '')
        setTotalChats(data.total_chats || 0)
        setProducts(data.kb_products || '')
        setHours(data.kb_hours || '')
        setFaq(data.kb_faq || '')
      }
      setLoading(false)
    }
    getData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        store_name: storeName,
        store_phone: storePhone,
        fonnte_token: token,
        system_prompt: prompt,
        kb_products: products,
        kb_hours: hours,
        kb_faq: faq
      })
      .eq('id', user.id)

    if (error) alert('Kesalahan: ' + error.message)
    else alert('Perubahan berhasil disimpan.')
    setSaving(false)
  }

  const handleToggleBot = async () => {
    const newStatus = !isActive
    setIsActive(newStatus)
    const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', user.id)
    if (error) {
        setIsActive(!newStatus)
        alert('Gagal mengubah status.')
    }
  }

  const spinText = (text: string) => {
    return text.replace(/\{([^{}]+)\}/g, (match, content) => {
        const choices = content.split('|')
        return choices[Math.floor(Math.random() * choices.length)]
    })
  }

  const handleSmartBroadcast = async () => {
    if (!token || !broadcastTarget || !broadcastMsg) return alert('Mohon lengkapi data broadcast.')
    setIsSending(true)
    setLogs([])
    
    const targets = broadcastTarget.split(',').map(t => t.trim()).filter(t => t)
    
    for (let i = 0; i < targets.length; i++) {
        const number = targets[i]
        const uniqueMessage = spinText(broadcastMsg)
        setProgress(`Mengirim ke ${number} (${i + 1}/${targets.length})...`)

        try {
            const res = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, target: number, message: uniqueMessage })
            })
            const result = await res.json()
            setLogs(prev => [`${number}: ${result.status ? 'Terkirim' : 'Gagal'}`, ...prev])
        } catch (err) {
            setLogs(prev => [`${number}: Error`, ...prev])
        }

        if (i < targets.length - 1) await new Promise(r => setTimeout(r, Math.floor(Math.random() * 3000) + 3000))
    }
    setIsSending(false)
    setProgress('Proses selesai.')
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-gray-500 text-sm">Memuat data...</div>

  // Styles Minimalis
  const inputStyle = "w-full bg-gray-900 border border-gray-800 text-white p-2.5 rounded text-sm focus:border-blue-700 outline-none transition placeholder-gray-600"
  const labelStyle = "block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide"
  const cardStyle = "bg-gray-900/50 p-6 border border-gray-800"

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200">
      
      {/* HEADER */}
      <header className="border-b border-gray-900 px-8 py-4 flex justify-between items-center bg-gray-950 sticky top-0 z-10">
        <h1 className="font-semibold text-lg tracking-tight text-white">BeeFirst Control Panel</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-gray-500 hover:text-white text-sm transition">
          Keluar
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* STATS */}
            <div className="p-6 bg-gray-900 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Interaksi</p>
                <p className="text-3xl font-medium text-white">{totalChats}</p>
                <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                    Estimasi penghematan waktu: ±{(totalChats * 2 / 60).toFixed(1)} jam.
                </div>
            </div>

            {/* STATUS SWITCH */}
            <div className={cardStyle}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-300">Status Sistem</span>
                    <span className={`text-xs px-2 py-1 border ${isActive ? 'border-green-900 text-green-500' : 'border-red-900 text-red-500'}`}>
                        {isActive ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
                <button 
                    onClick={handleToggleBot}
                    className={`w-full py-2 text-sm font-medium border transition-colors ${isActive ? 'border-red-900 text-red-500 hover:bg-red-900/10' : 'border-green-900 text-green-500 hover:bg-green-900/10'}`}
                >
                    {isActive ? 'Nonaktifkan Bot' : 'Aktifkan Bot'}
                </button>
            </div>

            {/* CONFIG */}
            <div className={cardStyle}>
                <h3 className="text-sm font-medium text-white mb-6 pb-2 border-b border-gray-800">Konfigurasi Dasar</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>Nama Bisnis</label>
                        <input type="text" className={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>
                     <div>
                        <label className={labelStyle}>API Token</label>
                        <input type="password" className={`${inputStyle} font-mono text-gray-400`} value={token} onChange={(e) => setToken(e.target.value)} />
                    </div>
                </div>
            </div>

             {/* PERSONA */}
             <div className={cardStyle}>
                <h3 className="text-sm font-medium text-white mb-6 pb-2 border-b border-gray-800">Instruksi Sistem (Persona)</h3>
                <textarea rows={4} className={inputStyle} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Deskripsikan bagaimana AI harus bersikap..." />
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* KNOWLEDGE BASE */}
            <div className={cardStyle}>
                <div className="mb-6 pb-2 border-b border-gray-800">
                    <h2 className="font-medium text-white">Basis Pengetahuan (Knowledge Base)</h2>
                    <p className="text-gray-500 text-xs mt-1">Data ini digunakan AI sebagai referensi jawaban.</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className={labelStyle}>Katalog Produk & Harga</label>
                        <textarea rows={6} className={`${inputStyle} font-mono text-xs leading-relaxed`} value={products} onChange={(e) => setProducts(e.target.value)} placeholder="Daftar produk dan harga..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelStyle}>Jam Operasional</label>
                            <textarea rows={3} className={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelStyle}>Informasi Lokasi / FAQ</label>
                            <textarea rows={3} className={inputStyle} value={faq} onChange={(e) => setFaq(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={handleSave} disabled={saving} className="bg-white text-black px-6 py-2 rounded text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50">
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>

            {/* BROADCAST TOOL */}
            <div className="bg-gray-900 p-6 border border-gray-800">
                <div className="mb-6">
                    <h2 className="font-medium text-white">Broadcast Tools</h2>
                    <p className="text-gray-500 text-xs mt-1">Pengiriman pesan massal dengan interval aman.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>Daftar Nomor (Pisahkan dengan koma)</label>
                        <input type="text" className={inputStyle} placeholder="6281xxx, 6285xxx" value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)} disabled={isSending} />
                    </div>
                    <div>
                        <label className={labelStyle}>Pesan (Support Spintax &#123;..|..&#125;)</label>
                        <textarea rows={3} className={inputStyle} placeholder="{Halo|Hai}, kami memiliki penawaran..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} disabled={isSending} />
                    </div>
                    
                    {isSending && <div className="text-xs font-mono text-yellow-500 py-2">Status: {progress}</div>}
                    
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSmartBroadcast} disabled={isSending} className="border border-gray-600 text-gray-300 hover:text-white px-6 py-2 rounded text-sm transition disabled:opacity-50">
                            {isSending ? 'Sedang Memproses' : 'Mulai Kirim'}
                        </button>
                    </div>
                    
                    {logs.length > 0 && (
                        <div className="mt-4 bg-black/30 p-4 max-h-32 overflow-y-auto text-xs font-mono text-gray-400 border border-gray-800">
                            {logs.map((log, idx) => <div key={idx} className="border-b border-gray-800/50 pb-1 mb-1 last:border-0">{log}</div>)}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}