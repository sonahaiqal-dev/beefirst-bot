'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
        alert("⚠️ Email dan Password wajib diisi!")
        return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Sukses Login
      router.push('/dashboard')
      
    } catch (error: any) {
      alert('❌ Gagal Login: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans text-gray-100">
      
      {/* Background Decoration (Opsional: Biar ada bias cahaya) */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"></div>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 relative z-10">
        
        <div className="text-center mb-8">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">Login Member</h1>
            <p className="text-gray-400 text-sm">Masuk untuk mengelola Bot BeeFirst.</p>
        </div>

        <div className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-500"
              placeholder="nama@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
            </div>
            <input 
              type="password" 
              className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-500"
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} // Tekan Enter langsung login
            />
          </div>

          {/* Tombol Login */}
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/50 mt-2 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                </span>
            ) : 'Masuk Dashboard 🚀'}
          </button>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-gray-400 text-sm">
          Belum punya akun? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition">Daftar dulu disini</Link>
        </p>

      </div>
    </div>
  )
}