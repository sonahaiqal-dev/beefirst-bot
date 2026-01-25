'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      // 1. Cek User Login
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // 2. Ambil Data Profil (Status Trial & Token)
      const { data: profilData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profilData) {
        setProfile(profilData)
        setToken(profilData.fonnte_token || '') // Isi token kalau sudah ada sebelumnya
      }
      setLoading(false)
    }

    getData()
  }, [])

  // Fungsi Simpan Token Fonnte
  const handleSaveToken = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ fonnte_token: token })
      .eq('id', user.id)

    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      alert('✅ Token Berhasil Disimpan!')
    }
    setSaving(false)
  }

  // Hitung Sisa Hari Trial
  const hitungSisaHari = (tglBerakhir: string) => {
    const end = new Date(tglBerakhir).getTime()
    const now = new Date().getTime()
    const sisa = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return sisa > 0 ? sisa + ' Hari Lagi' : 'Sudah Habis'
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
          
          {/* KARTU 1: STATUS LANGGANAN */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 h-full">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Status Akun</h2>
              
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  profile?.subscription_status === 'trial' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile?.subscription_status === 'trial' ? 'TRIAL AKTIF' : profile?.subscription_status}
                </span>
              </div>

              {profile?.trial_ends_at && (
                <div>
                  <p className="text-gray-500 text-sm">Berakhir pada:</p>
                  <p className="font-medium text-gray-800 mb-1">
                    {new Date(profile.trial_ends_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                  <p className="text-xs text-red-500 font-bold">
                    (Sisa {hitungSisaHari(profile.trial_ends_at)})
                  </p>
                </div>
              )}

              <button className="w-full mt-6 bg-yellow-400 text-yellow-900 font-bold py-2 rounded-lg hover:bg-yellow-500 text-sm">
                🔥 Upgrade Premium
              </button>
            </div>
          </div>

          {/* KARTU 2: CONFIGURATION */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⚙️ Konfigurasi Bot
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Fonnte
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Ambil token di <a href="https://fonnte.com" target="_blank" className="text-blue-500 underline">fonnte.com</a> agar bot bisa nyambung ke WA kamu.
                  </p>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 text-black font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: 12345678abcdefg"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveToken}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan 💾'}
                  </button>
                </div>
              </div>

              {/* Tempat buat info device nanti */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  Status Device: <span className="text-gray-400 italic">Belum terkoneksi (Nanti kita update ini)</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}