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
        alert("Mohon isi email dan password.")
        return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: any) {
      alert('Gagal Masuk: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="w-full max-w-sm">
        
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-white mb-2">Selamat Datang Kembali</h1>
            <p className="text-gray-500 text-sm">Masuk ke panel kontrol BeeFirst.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">EMAIL</label>
            <input 
              type="email" 
              className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-700 focus:outline-none transition text-sm"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-gray-500">PASSWORD</label>
            </div>
            <input 
              type="password" 
              className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-700 focus:outline-none transition text-sm"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-medium py-3 rounded transition mt-4 disabled:opacity-50 text-sm"
          >
            {loading ? 'Memuat...' : 'Masuk Dashboard'}
          </button>
        </div>

        <p className="mt-8 text-center md:text-left text-gray-600 text-sm">
          Belum terdaftar? <Link href="/register" className="text-gray-400 hover:text-white transition">Buat akun baru</Link>
        </p>

      </div>
    </div>
  )
}