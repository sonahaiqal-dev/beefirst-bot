'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  
  // State Data
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 1. Settings Akun
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [token, setToken] = useState('')
  
  // 2. Fitur Utama
  const [isActive, setIsActive] = useState(true) // Saklar Bot
  const [prompt, setPrompt] = useState('')
  
  // 3. Knowledge Base
  const [products, setProducts] = useState('')
  const [hours, setHours] = useState('')
  const [faq, setFaq] = useState('')

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
        // Load semua data
        setStoreName(data.store_name || '')
        setStorePhone(data.store_phone || '')
        setToken(data.fonnte_token || '')
        setIsActive(data.is_active ?? true) // Default true kalau null
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
        is_active: isActive, // Simpan status saklar
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

  if (loading) return <div className="min-h-screen flex justify-center items-center text-slate-500">Memuat Dashboard... ⏳</div>

  // Styles
  const inputStyle = "w-full border border-slate-300 bg-white text-slate-700 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  const labelStyle = "block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider"
  const cardStyle = "bg-white p-6 rounded-xl shadow-sm border border-slate-200"

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* NAVBAR ATAS */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">🐝</div>
            <div>
                <h1 className="font-bold text-lg leading-tight">BeeFirst</h1>
                <p className="text-xs text-slate-500">SaaS Dashboard</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <p className="text-sm hidden md:block text-slate-500">Halo, {storeName || user?.email}</p>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded transition">Keluar</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === SIDEBAR KIRI (Pengaturan Akun) === */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. KARTU SAKLAR UTAMA (SWITCH ON/OFF) */}
            <div className={`${cardStyle} border-l-4 ${isActive ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Status Bot</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isActive ? 'AKTIF ●' : 'MATI ○'}
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    {isActive ? 'Bot akan membalas pesan otomatis.' : 'Bot sedang tidur. Anda bisa balas manual.'}
                </p>
                
                {/* TOMBOL TOGGLE */}
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isActive ? '🔴 Matikan Bot' : '🟢 Hidupkan Bot'}
                </button>
            </div>

            {/* 2. PROFIL TOKO */}
            <div className={cardStyle}>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🏢 Profil Bisnis</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className={labelStyle}>Nama Toko</label>
                        <input type="text" className={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Contoh: Kopi Senja" />
                    </div>
                    <div>
                        <label className={labelStyle}>No. WhatsApp Owner</label>
                        <input type="text" className={inputStyle} value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="0812..." />
                    </div>
                     <div>
                        <label className={labelStyle}>Token Fonnte</label>
                        <input type="text" className={inputStyle} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste Token Disini..." />
                        <a href="https://fonnte.com" target="_blank" className="text-xs text-blue-500 hover:underline mt-1 block">Ambil token di Fonnte ↗</a>
                    </div>
                </div>
            </div>

             {/* 3. PROMPT UTAMA */}
             <div className={cardStyle}>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🎭 Peran AI</h3>
                <label className={labelStyle}>Instruksi Dasar</label>
                <textarea rows={4} className={inputStyle} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Kamu adalah CS yang ramah..." />
            </div>
        </div>

        {/* === KONTEN KANAN (Knowledge Base) === */}
        <div className="lg:col-span-8 space-y-6">
            
            <div className={cardStyle}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600 text-xl">📚</div>
                    <div>
                        <h2 className="font-bold text-xl text-slate-800">Database Pengetahuan</h2>
                        <p className="text-sm text-slate-500">Ajari bot tentang produk dan tokomu.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Produk */}
                    <div>
                        <label className={labelStyle}>📦 Daftar Produk & Harga</label>
                        <textarea rows={6} className={`${inputStyle} font-mono text-sm`} value={products} onChange={(e) => setProducts(e.target.value)} placeholder="- Produk A: Rp 10.000..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Jam Buka */}
                        <div>
                            <label className={labelStyle}>⏰ Jam Operasional</label>
                            <textarea rows={4} className={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Senin-Jumat: 09.00 - 17.00" />
                        </div>
                        {/* FAQ */}
                        <div>
                            <label className={labelStyle}>ℹ️ FAQ / Info Lain</label>
                            <textarea rows={4} className={inputStyle} value={faq} onChange={(e) => setFaq(e.target.value)} placeholder="Lokasi, Wifi, dll..." />
                        </div>
                    </div>
                </div>

                {/* TOMBOL SIMPAN MELAYANG DI BAWAH (MOBILE FRIENDLY) */}
                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition flex items-center gap-2"
                    >
                        {saving ? 'Menyimpan...' : '💾 Simpan Semua Perubahan'}
                    </button>
                </div>
            </div>

            {/* AREA BROADCAST (COMING SOON) */}
            <div className="bg-slate-200 p-6 rounded-xl border border-slate-300 border-dashed text-center opacity-70">
                <h3 className="font-bold text-slate-600">📡 Fitur Broadcast (Coming Soon)</h3>
                <p className="text-sm text-slate-500">Menu kirim pesan massal akan muncul disini nanti.</p>
            </div>

        </div>
      </div>
    </div>
  )
}