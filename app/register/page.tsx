'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  
  // Fungsi saat tombol Daftar diklik
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    // 1. Minta Supabase daftarkan user baru
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setMsg('❌ Gagal: ' + error.message)
    } else {
      // Jika berhasil, Supabase akan kirim email konfirmasi
      // Dan Trigger SQL kita akan otomatis bikin data profil + trial 7 hari
      setMsg('✅ Sukses! Cek email kamu untuk verifikasi.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Daftar BeeFirst Bot</h1>
          <p className="text-gray-500 text-sm">Dapatkan Free Trial 7 Hari Otomatis</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Bisnis</label>
            <input 
              type="email" 
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Sedang Mendaftarkan...' : 'Mulai Trial Sekarang 🚀'}
          </button>
        </form>

        {msg && (
          <div className={`mt-6 p-3 text-sm text-center rounded-lg ${msg.includes('Gagal') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}