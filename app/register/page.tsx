'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('') // State baru buat No WA
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // GANTI NOMOR INI DENGAN NOMOR WA ADMIN (KAMU)
  const ADMIN_WA = "62895402497840" 

  const handleRegister = async () => {
    if (!email || !password || !phone) {
        alert("Mohon lengkapi Email, Password, dan Nomor WhatsApp.")
        return
    }

    setLoading(true)
    try {
      // 1. Buat Akun Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Simpan Profil & Nomor WA
      if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                store_name: storeName || 'Toko Baru',
                whatsapp: phone, // Simpan nomor WA user
                is_active: true, 
                fonnte_token: null 
            })
            .eq('id', authData.user.id)
        
        if (profileError) console.error("Error update profile:", profileError)
      }

      // 3. SUKSES -> ARAHKAN KE WA ADMIN
      const message = `Halo Admin BeeFirst, saya baru saja mendaftar dengan email: *${email}*. Mohon bantu aktivasi bot saya. Terima kasih!`
      const waLink = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`

      // Buka WA di tab baru
      window.open(waLink, '_blank')

      alert('Registrasi Berhasil! Anda akan diarahkan ke WhatsApp Admin untuk aktivasi.')
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
            <h1 className="text-2xl font-medium text-white mb-2">Daftar Akun</h1>
            <p className="text-gray-500 text-sm">Lengkapi data agar Admin bisa menghubungi Anda.</p>
        </div>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">EMAIL BISNIS</label>
            <input 
              type="email" 
              className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm placeholder-gray-700"
              placeholder="nama@email.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Password */}
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

          <div className="pt-4 border-t border-gray-900 space-y-5">
             {/* Nomor WA (BARU) */}
             <div>
                <label className="block text-xs font-medium text-blue-400 mb-2 tracking-wide">NOMOR WHATSAPP (AKTIF)</label>
                <input 
                type="tel" 
                className="w-full bg-gray-900 text-white border border-blue-900/50 p-3 rounded focus:border-blue-600 focus:outline-none transition text-sm placeholder-gray-700"
                placeholder="Contoh: 08123456789"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                />
                <p className="text-[10px] text-gray-600 mt-1">
                    *Admin akan menghubungi nomor ini untuk aktivasi token.
                </p>
            </div>

             {/* Nama Toko */}
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">NAMA TOKO</label>
                <input 
                type="text" 
                className="w-full bg-gray-900 text-white border border-gray-800 p-3 rounded focus:border-blue-800 focus:outline-none transition text-sm placeholder-gray-700"
                placeholder="Contoh: Toko Berkah"
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                />
            </div>
          </div>

          <button 
            onClick={handleRegister} 
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 rounded hover:bg-gray-200 transition mt-2 disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? 'Memproses...' : 'Daftar & Hubungi Admin 🚀'}
          </button>
        </div>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Sudah punya akun? <Link href="/login" className="text-gray-400 hover:text-white transition border-b border-gray-800 hover:border-gray-500 pb-0.5">Masuk</Link>
        </p>

      </div>
    </div>
  )
}