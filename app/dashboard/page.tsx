'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // State form
  const [token, setToken] = useState('')
  const [prompt, setPrompt] = useState('')
  const [knowledge, setKnowledge] = useState('') // <-- State baru
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profilData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profilData) {
        setProfile(profilData)
        setToken(profilData.fonnte_token || '')
        setPrompt(profilData.system_prompt || '')
        setKnowledge(profilData.knowledge_base || '') // <-- Load data
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
        knowledge_base: knowledge // <-- Simpan data
      })
      .eq('id', user.id)

    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      alert('✅ Data Toko Berhasil Disimpan!')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-600">Sedang memuat data... ⏳</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard BeeFirst</h1>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-red-600 font-medium hover:underline">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KIRI: STATUS */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 sticky top-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase mb-2">Status</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                {profile?.subscription_status === 'trial' ? 'TRIAL AKTIF' : 'PREMIUM'}
              </span>
              <p className="mt-4 text-xs text-gray-500 break-all">{user?.email}</p>
            </div>
          </div>

          {/* KANAN: PENGATURAN */}
          <div className="md:col-span-2 space-y-6">
            
            {/* 1. KONEKSI */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🔗 Koneksi WhatsApp</h2>
              <label className="block text-sm font-bold text-gray-700 mb-1">Token Fonnte</label>
              <input 
                type="text" 
                className="w-full border p-3 rounded-lg font-mono text-sm bg-gray-50"
                placeholder="Masukkan Token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            {/* 2. KEPRIBADIAN (PROMPT) */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🎭 Kepribadian Bot</h2>
              <label className="block text-sm font-bold text-gray-700 mb-1">Instruksi Perilaku</label>
              <p className="text-xs text-gray-500 mb-2">Contoh: "Kamu adalah Admin Klinik yang ramah & sopan."</p>
              <textarea 
                rows={3}
                className="w-full border p-3 rounded-lg text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* 3. KNOWLEDGE BASE (DATA TOKO) - BARU! */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-blue-700">📚 Data Pengetahuan (Knowledge Base)</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">FITUR BARU</span>
              </div>
              
              <label className="block text-sm font-bold text-gray-700 mb-1">Fakta & Data Toko</label>
              <p className="text-xs text-gray-500 mb-2">
                Copy-paste info produk, daftar harga, jam buka, atau FAQ di sini. Bot akan menjawab berdasarkan data ini.
              </p>
              <textarea 
                rows={10}
                className="w-full border border-blue-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh:
- Nasi Goreng: Rp 15.000
- Es Teh: Rp 5.000
- Jam Buka: 08.00 - 22.00
- Alamat: Jl. Sudirman No 1..."
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
              />
            </div>

            {/* TOMBOL SAVE */}
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-lg transition"
              >
                {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan 💾'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}