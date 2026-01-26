'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  
  // State untuk form
  const [token, setToken] = useState('')
  const [prompt, setPrompt] = useState('')
  
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
        // Ambil prompt dari database, atau pakai default kalau kosong
        setPrompt(profilData.system_prompt || 'Kamu adalah asisten AI yang ramah dan membantu.')
      }
      setLoading(false)
    }

    getData()
  }, [])

  // Fungsi Simpan Pengaturan (Token & Prompt sekaligus)
  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        fonnte_token: token,
        system_prompt: prompt 
      })
      .eq('id', user.id)

    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      alert('✅ Pengaturan Berhasil Disimpan!')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-600">Sedang memuat data bos... ⏳</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard BeeFirst</h1>
            <p className="text-gray-500">Kelola bot WhatsApp kamu disini.</p>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KARTU KIRI: STATUS */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status Akun</h2>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  profile?.subscription_status === 'trial' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile?.subscription_status === 'trial' ? 'TRIAL AKTIF' : profile?.subscription_status}
                </span>
              </div>
              <p className="text-xs text-gray-500">Email: {user?.email}</p>
            </div>
          </div>

          {/* KARTU KANAN: KONFIGURASI */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                ⚙️ Pengaturan Bot
              </h2>
              
              <div className="space-y-6">
                
                {/* 1. TOKEN INPUT */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Token Fonnte (Wajib)
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Masukkan Token Fonnte..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>

                {/* 2. PROMPT INPUT (FITUR BARU) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Instruksi AI (System Prompt) 🧠
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Tentukan kepribadian bot kamu. Contoh: "Kamu adalah Admin Toko Sepatu yang ramah."
                  </p>
                  <textarea 
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Kamu adalah asisten..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan 💾'}
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}