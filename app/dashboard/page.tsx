'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // State Form
  const [token, setToken] = useState('')
  const [prompt, setPrompt] = useState('')
  
  // State Knowledge Base (3 Kolom)
  const [products, setProducts] = useState('')
  const [hours, setHours] = useState('')
  const [faq, setFaq] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setProfile(data)
        setToken(data.fonnte_token || '')
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
        fonnte_token: token,
        system_prompt: prompt,
        kb_products: products,
        kb_hours: hours,
        kb_faq: faq
      })
      .eq('id', user.id)

    if (error) alert('Gagal: ' + error.message)
    else alert('✅ Data Berhasil Disimpan!')
    
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium">Memuat Data... ⏳</div>

  // --- STYLE BARU (Slate & Blue Harmony) ---
  // Teks: Slate-700 (Abu kebiruan, enak di mata)
  // Border: Slate-200 (Tipis elegan)
  // Focus: Ring Biru (Sesuai tema)
  const inputStyle = "w-full border border-slate-300 bg-white text-slate-700 font-medium p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm placeholder-slate-400"
  const labelStyle = "block text-sm font-bold text-slate-700 mb-2"
  const cardStyle = "bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition duration-300"

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">BeeFirst Dashboard 🐝</h1>
            <p className="text-slate-500 text-sm mt-1">Pusat kendali bot cerdas Anda.</p>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} 
            className="bg-white text-red-500 px-5 py-2 rounded-full text-sm font-bold border border-red-100 hover:bg-red-50 transition"
          >
            Keluar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR KIRI (4 Kolom) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status Card */}
            <div className={`${cardStyle} bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none`}>
              <h2 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Paket Saat Ini</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold">
                  {profile?.subscription_status === 'trial' ? 'Starter Trial' : 'Premium Pro'}
                </span>
                <span className="bg-blue-500 bg-opacity-30 px-2 py-0.5 rounded text-xs">Aktif</span>
              </div>
              <p className="text-blue-100 text-xs opacity-80 truncate">{user?.email}</p>
            </div>

            {/* Token Input */}
            <div className={cardStyle}>
              <label className={labelStyle}>🔑 Token Fonnte</label>
              <input 
                type="text" 
                className={inputStyle}
                placeholder="Masukkan Token WA..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">Wajib diisi agar bot bisa membalas.</p>
            </div>

            {/* Prompt System */}
            <div className={cardStyle}>
              <label className={labelStyle}>🎭 Peran Bot (System Prompt)</label>
              <textarea 
                rows={4}
                className={inputStyle}
                placeholder="Cth: Kamu adalah CS toko sepatu yang gaul dan suka pakai emoji..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>

          {/* MAIN CONTENT KANAN (8 Kolom) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Knowledge Base Section */}
            <div className={cardStyle}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Database Pengetahuan</h2>
                  <p className="text-slate-500 text-sm">Isi data di bawah ini agar bot Anda pintar.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Produk */}
                <div>
                  <label className={labelStyle}>📦 Daftar Produk & Harga</label>
                  <textarea 
                    rows={6}
                    className={`${inputStyle} font-mono text-xs md:text-sm`} // Font mono biar rapi kayak struk
                    placeholder={`- Nasi Goreng: Rp 15.000\n- Es Teh: Rp 5.000\n- Paket Hemat: Rp 20.000`}
                    value={products}
                    onChange={(e) => setProducts(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. Jam Buka */}
                  <div>
                    <label className={labelStyle}>⏰ Jam Operasional</label>
                    <textarea 
                      rows={4}
                      className={inputStyle}
                      placeholder={`Senin-Jumat: 08.00 - 22.00\nSabtu: 10.00 - 23.00`}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  
                  {/* 3. FAQ */}
                  <div>
                    <label className={labelStyle}>ℹ️ Info Lain / FAQ</label>
                    <textarea 
                      rows={4}
                      className={inputStyle}
                      placeholder={`Lokasi: Jl. Sudirman\nWifi: BeeFirst123`}
                      value={faq}
                      onChange={(e) => setFaq(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>Menyimpan... ⏳</>
                ) : (
                  <>💾 Simpan Semua Data</>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}