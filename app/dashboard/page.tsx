'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  
  // State Data
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Settings
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [token, setToken] = useState('')
  const [isActive, setIsActive] = useState(true) 
  const [prompt, setPrompt] = useState('')
  
  // Knowledge Base
  const [products, setProducts] = useState('')
  const [hours, setHours] = useState('')
  const [faq, setFaq] = useState('')

  // State Broadcast (BARU) 📡
  const [broadcastTarget, setBroadcastTarget] = useState('')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

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
        is_active: isActive,
        system_prompt: prompt,
        kb_products: products,
        kb_hours: hours,
        kb_faq: faq
      })
      .eq('id', user.id)

    if (error) alert('Gagal: ' + error.message)
    else alert('✅ Pengaturan Berhasil Disimpan!')
    setSaving(false)
  }

  // Fungsi Kirim Broadcast (BARU) 📡
  const handleBroadcast = async () => {
    if (!token) return alert('⚠️ Masukkan Token Fonnte dulu di menu kiri!')
    if (!broadcastTarget || !broadcastMsg) return alert('⚠️ Nomor tujuan dan pesan wajib diisi!')

    setSendingBroadcast(true)
    try {
        const res = await fetch('/api/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                target: broadcastTarget,
                message: broadcastMsg
            })
        })
        const data = await res.json()
        
        if (data.status) {
            alert('✅ Broadcast Terkirim! Cek WhatsApp kamu.')
            setBroadcastMsg('') // Reset pesan
        } else {
            alert('❌ Gagal: ' + (data.reason || 'Cek koneksi Fonnte'))
        }
    } catch (err) {
        alert('❌ Error sistem.')
    }
    setSendingBroadcast(false)
  }

  if (loading) return <div className="min-h-screen flex justify-center items-center text-slate-500">Memuat Dashboard... ⏳</div>

  // Styles
  const inputStyle = "w-full border border-slate-300 bg-white text-slate-700 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  const labelStyle = "block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider"
  const cardStyle = "bg-white p-6 rounded-xl shadow-sm border border-slate-200"

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">🐝</div>
            <div>
                <h1 className="font-bold text-lg leading-tight">BeeFirst</h1>
                <p className="text-xs text-slate-500">SaaS Dashboard</p>
            </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded transition">Keluar</button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === SIDEBAR KIRI === */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Saklar Bot */}
            <div className={`${cardStyle} border-l-4 ${isActive ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Status Bot</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isActive ? 'AKTIF ●' : 'MATI ○'}
                    </div>
                </div>
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-2 mt-2 rounded-lg font-bold text-white text-sm transition-all shadow-md ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isActive ? 'Matikan Bot' : 'Hidupkan Bot'}
                </button>
            </div>

            {/* Profil Toko */}
            <div className={cardStyle}>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🏢 Profil Bisnis</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>Nama Toko</label>
                        <input type="text" className={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>
                     <div>
                        <label className={labelStyle}>Token Fonnte (Wajib)</label>
                        <input type="password" className={inputStyle} value={token} onChange={(e) => setToken(e.target.value)} />
                    </div>
                </div>
            </div>

             {/* Prompt AI */}
             <div className={cardStyle}>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🎭 Peran AI</h3>
                <textarea rows={4} className={inputStyle} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Kamu adalah CS..." />
            </div>
        </div>

        {/* === KONTEN KANAN === */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Knowledge Base */}
            <div className={cardStyle}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 text-xl">📚</div>
                    <h2 className="font-bold text-xl text-slate-800">Knowledge Base</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>📦 Daftar Produk</label>
                        <textarea rows={4} className={`${inputStyle} font-mono text-sm`} value={products} onChange={(e) => setProducts(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>⏰ Jam Buka</label>
                            <textarea rows={3} className={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelStyle}>ℹ️ FAQ</label>
                            <textarea rows={3} className={inputStyle} value={faq} onChange={(e) => setFaq(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-right">
                    <button onClick={handleSave} disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition">
                        {saving ? '...' : 'Simpan Data'}
                    </button>
                </div>
            </div>

            {/* === FITUR BROADCAST (BARU DI SINI) === */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg text-2xl">📡</div>
                    <div>
                        <h2 className="font-bold text-xl">Broadcast Pesan</h2>
                        <p className="text-indigo-100 text-xs">Kirim pesan massal ke banyak nomor sekaligus.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1 uppercase">Nomor Tujuan (Pisahkan Koma)</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg text-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white"
                            placeholder="0812xxx, 0813xxx, 0857xxx"
                            value={broadcastTarget}
                            onChange={(e) => setBroadcastTarget(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-200 mb-1 uppercase">Isi Pesan</label>
                        <textarea 
                            rows={3} 
                            className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg text-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white"
                            placeholder="Halo kak, ada promo baru nih..."
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleBroadcast}
                            disabled={sendingBroadcast}
                            className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2"
                        >
                            {sendingBroadcast ? 'Mengirim... 🚀' : 'Kirim Broadcast 📨'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}