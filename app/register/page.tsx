'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Tambahan Form Baru:
  const [token, setToken] = useState('') 
  const [storeName, setStoreName] = useState('')
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !token) {
        alert("⚠️ Email, Password, dan Token WA Wajib diisi!")
        return
    }

    setLoading(true)
    try {
      // 1. DAFTAR AKUN BARU (AUTH)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. JIKA SUKSES, LANGSUNG UPDATE DATA PROFIL (Token & Nama Toko)
      if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                fonnte_token: token,
                store_name: storeName || 'Toko Baru', // Default kalau kosong
                is_active: true // Langsung nyalakan bot
            })
            .eq('id', authData.user.id)
        
        if (profileError) {
            console.error("Gagal simpan token:", profileError)
            // Tetap lanjut, karena akun sudah jadi. Nanti user bisa isi di dashboard.
        }
      }

      alert('✅ Registrasi Berhasil! Silakan Login.')
      router.push('/login')

    } catch (error: any) {
      alert('❌ Gagal: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Daftar BeeFirst 🐝</h1>
            <p className="text-gray-400 text-sm">Buat akun & langsung hubungkan botmu.</p>
        </div>

        <div className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email</label>
            <input 
              type="email" 
              className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="nama@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div className="border-t border-gray-700 my-4 pt-4">
             <p className="text-xs text-blue-400 mb-3 font-bold text-center">👇 LANGSUNG SETUP BOT 👇</p>
             
             {/* Nama Toko */}
             <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nama Toko (Opsional)</label>
                <input 
                type="text" 
                className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Toko Sepatu Jaya" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                />
            </div>

             {/* Token Fonnte (WAJIB) */}
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Token Fonnte (Wajib)</label>
                <input 
                type="text" 
                className="w-full bg-gray-900 text-green-400 border border-green-700 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm"
                placeholder="Paste Token WA Disini..." 
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                />
                <p className="text-[10px] text-gray-500 mt-1">
                    *Belum punya token? <a href="https://fonnte.com" target="_blank" className="text-green-400 hover:underline">Ambil di Fonnte.com</a>
                </p>
            </div>
          </div>

          <button 
            onClick={handleRegister} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar & Aktifkan Bot 🚀'}
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Sudah punya akun? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">Login disini</Link>
        </p>

      </div>
    </div>
  )
}