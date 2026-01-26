'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  
  // State Loading
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State Data
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [token, setToken] = useState('')
  const [isActive, setIsActive] = useState(true) 
  const [prompt, setPrompt] = useState('')
  const [totalChats, setTotalChats] = useState(0)
  
  // Knowledge Base
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

  // 1. FUNGSI SIMPAN MANUAL
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

    if (error) alert('Gagal: ' + error.message)
    else alert('✅ Data Toko Berhasil Disimpan!')
    setSaving(false)
  }

  // 2. FUNGSI SAKLAR AUTO-SAVE
  const handleToggleBot = async () => {
    const newStatus = !isActive
    setIsActive(newStatus)

    const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', user.id)

    if (error) {
        setIsActive(!newStatus)
        alert('Gagal update status bot. Cek koneksi.')
    }
  }

  const spinText = (text: string) => {
    return text.replace(/\{([^{}]+)\}/g, (match, content) => {
        const choices = content.split('|')
        return choices[Math.floor(Math.random() * choices.length)]
    })
  }

  const handleSmartBroadcast = async () => {
    if (!token) return alert('⚠️ Token WA kosong! Isi di menu kiri.')
    if (!broadcastTarget || !broadcastMsg) return alert('⚠️ Nomor & Pesan wajib diisi!')

    setIsSending(true)
    setLogs([])
    
    const targets = broadcastTarget.split(',').map(t => t.trim()).filter(t => t)
    const total = targets.length

    for (let i = 0; i < total; i++) {
        const number = targets[i]
        const uniqueMessage = spinText(broadcastMsg)
        
        setProgress(`Mengirim ke ${number} (${i + 1}/${total})...`)

        try {
            const res = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, target: number, message: uniqueMessage })
            })
            
            const result = await res.json()
            if(result.status) setLogs(prev => [`✅ ${number}: Sukses`, ...prev])
            else setLogs(prev => [`❌ ${number}: Gagal`, ...prev])

        } catch (err) {
            setLogs(prev => [`❌ ${number}: Error Sistem`, ...prev])
        }

        if (i < total - 1) {
            const delay = Math.floor(Math.random() * 3000) + 3000
            setProgress(`Menunggu ${delay/1000} detik biar aman...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }

    setIsSending(false)
    setProgress('🎉 Broadcast Selesai!')
    alert('Selesai! Cek laporan di bawah.')
  }

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center text-gray-500 font-mono">⏳ Memuat Dashboard...</div>

  // Styles Tailwind DARK MODE 🌑
  const inputStyle = "w-full border border-gray-600 bg-gray-700 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition placeholder-gray-400"
  const labelStyle = "block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider"
  const cardStyle = "bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700"

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
      
      {/* NAVBAR */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl shadow-lg shadow-blue-900/50">🐝</div>
            <div>
                <h1 className="font-bold text-lg leading-tight text-white">BeeFirst Bot</h1>
                <p className="text-xs text-gray-400">SaaS Dashboard User</p>
            </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-red-400 text-sm font-bold hover:bg-gray-700 px-4 py-2 rounded-lg transition border border-gray-600 hover:border-red-500">
          Keluar 🚪
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === SIDEBAR KIRI === */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* STATISTIK */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 rounded-xl shadow-xl border border-blue-500/30 transform hover:scale-[1.02] transition duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg text-xl">🚀</div>
                    <h2 className="font-bold text-lg text-white">Kinerja Bot</h2>
                </div>
                <div className="mt-2">
                    <p className="text-blue-100 text-xs uppercase font-bold tracking-wider">Total Pesan Dijawab</p>
                    <p className="text-4xl font-extrabold mt-1 tracking-tight text-white">{totalChats}</p>
                </div>
                <div className="mt-4 text-[10px] bg-black/30 p-2 rounded inline-block text-blue-100 font-mono border border-white/10">
                    🤖 Hemat waktu ± {(totalChats * 2 / 60).toFixed(1)} jam kerja!
                </div>
            </div>

            {/* SAKLAR BOT */}
            <div className={`${cardStyle} border-l-4 ${isActive ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg text-white">Status Bot</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                        {isActive ? 'AKTIF ●' : 'MATI ○'}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">Klik tombol untuk menyalakan/mematikan bot.</p>
                
                <button 
                    onClick={handleToggleBot}
                    className={`w-full py-2 rounded-lg font-bold text-white text-sm transition-all shadow-lg transform active:scale-95 border ${isActive ? 'bg-red-600 hover:bg-red-500 border-red-800' : 'bg-green-600 hover:bg-green-500 border-green-800'}`}
                >
                    {isActive ? 'Matikan Bot 📴' : 'Hidupkan Bot 🔛'}
                </button>
            </div>

            {/* PROFIL TOKO */}
            <div className={cardStyle}>
                <h3 className="font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">🏢 Profil Bisnis</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>Nama Toko</label>
                        <input type="text" className={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Contoh: Toko Berkah" />
                    </div>
                     <div>
                        <label className={labelStyle}>Token Fonnte (Wajib)</label>
                        <input type="password" className={`${inputStyle} font-mono text-green-400 bg-gray-900 border-green-900 focus:border-green-500`} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Isi Token WA disini..." />
                    </div>
                </div>
            </div>

             {/* PERAN AI */}
             <div className={cardStyle}>
                <h3 className="font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">🎭 Karakter AI</h3>
                <textarea rows={4} className={inputStyle} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Contoh: Kamu adalah CS Toko Sepatu yang ramah..." />
            </div>
        </div>

        {/* === KONTEN KANAN === */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* KNOWLEDGE BASE */}
            <div className={cardStyle}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-900/50 border border-blue-800 p-2 rounded-lg text-blue-400 text-xl">📚</div>
                    <div>
                        <h2 className="font-bold text-xl text-white">Knowledge Base</h2>
                        <p className="text-gray-400 text-xs">Isi data ini agar bot pintar menjawab pertanyaan customer.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>📦 Daftar Produk & Harga</label>
                        <textarea rows={5} className={`${inputStyle} font-mono text-sm`} value={products} onChange={(e) => setProducts(e.target.value)} placeholder="- Sepatu Nike: Rp 500rb&#10;- Kaos Polos: Rp 50rb" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>⏰ Jam Buka</label>
                            <textarea rows={3} className={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Senin-Jumat: 08.00 - 17.00" />
                        </div>
                        <div>
                            <label className={labelStyle}>ℹ️ FAQ / Lokasi</label>
                            <textarea rows={3} className={inputStyle} value={faq} onChange={(e) => setFaq(e.target.value)} placeholder="Lokasi: Jl. Merdeka No. 10" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={handleSave} disabled={saving} className="bg-white text-gray-900 px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition shadow-lg disabled:opacity-50">
                        {saving ? 'Menyimpan... 💾' : 'Simpan Perubahan ✅'}
                    </button>
                </div>
            </div>

            {/* SMART BROADCAST */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-xl border border-indigo-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/10 p-2 rounded-lg text-2xl border border-white/10">📡</div>
                    <div>
                        <h2 className="font-bold text-xl">Smart Broadcast</h2>
                        <p className="text-indigo-200 text-xs">Fitur Anti-Banned dengan Spintax & Delay Otomatis.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1 uppercase">Nomor Tujuan</label>
                        <input type="text" className="w-full bg-black/20 border border-white/10 text-white p-3 rounded-lg text-sm outline-none focus:bg-black/40 focus:border-indigo-400 transition placeholder-indigo-300/50" placeholder="0812xxx, 0857xxx" value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)} disabled={isSending} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1 uppercase">Isi Pesan</label>
                        <textarea rows={3} className="w-full bg-black/20 border border-white/10 text-white p-3 rounded-lg text-sm outline-none focus:bg-black/40 focus:border-indigo-400 transition placeholder-indigo-300/50" placeholder="{Halo|Hai} kak..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} disabled={isSending} />
                    </div>
                    
                    {isSending && <div className="bg-yellow-900/30 p-3 rounded-lg text-sm font-mono text-yellow-300 animate-pulse border border-yellow-500/30">⏳ {progress}</div>}
                    
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSmartBroadcast} disabled={isSending} className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-lg flex items-center gap-2 disabled:opacity-50 border border-indigo-400/50">
                            {isSending ? 'Sedang Mengirim... 🚀' : 'Mulai Broadcast 📨'}
                        </button>
                    </div>
                    
                    {logs.length > 0 && (
                        <div className="mt-4 bg-black/40 p-3 rounded-lg max-h-32 overflow-y-auto text-xs font-mono space-y-1 border border-white/10 custom-scrollbar">
                            {logs.map((log, idx) => <div key={idx} className="text-white/80 border-b border-white/5 pb-1 last:border-0">{log}</div>)}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}