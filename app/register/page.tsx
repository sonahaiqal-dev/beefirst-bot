'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('') 
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !token) {
        alert("Mohon lengkapi seluruh data formulir.")
        return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        await supabase
            .from('profiles')
            .update({ 
                fonnte_token: token,
                store_name: storeName || 'Toko Baru',
                is_active: true
            })
            .eq('id', authData.user.id)
      }

      alert('Akun berhasil dibuat. Silakan masuk.')
      router.push('/login')

    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6 font-sans">
      <div className="w-full max-w-sm">
        
        <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-2">Buat Akun Baru</h1>
            <p className="text-gray-500 text-sm">Lengkapi data untuk memulai integrasi.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">EMAIL BISNIS</label>
            <input 
              type="email" 
              className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm placeholder-gray-700"
              placeholder="nama@perusahaan.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">PASSWORD</label>
            <input 
              type="password" 
              className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm placeholder-gray-700"
              placeholder="Minimal 6 karakter"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div className="pt-4 border-t border-gray-900">
             <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">NAMA BISNIS / TOKO</label>
                <input 
                type="text" 
                className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm placeholder-gray-700"
                placeholder="Contoh: Kopi Senja"
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                />
            </div>

             <div>
                <label className="block text-xs font-medium text-blue-500 mb-2 tracking-wide">TOKEN WHATSAPP (FONNTE)</label>
                <input 
                type="text" 
                className="w-full bg-gray-900 text-gray-300 border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm font-mono placeholder-gray-700"
                placeholder="Tempel token API di sini"
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                />
                
                {/* === LINK BANTUAN FONNTE DI SINI === */}
                <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                    Belum memiliki token API? 
                    <a 
                        href="https://fonnte.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white ml-1 transition-colors"
                    >
                        Dapatkan token gratis di Fonnte.com &nearr;
                    </a>
                </p>
            </div>
          </div>

          <button 
            onClick={handleRegister} 
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 rounded hover:bg-gray-200 transition mt-2 disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? 'Memproses...' : 'Daftar & Hubungkan'}
          </button>
        </div>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Sudah memiliki akun? <Link href="/login" className="text-gray-400 hover:text-white transition border-b border-gray-800 hover:border-gray-500 pb-0.5">Masuk di sini</Link>
        </p>

      </div>
    </div>
  )
}