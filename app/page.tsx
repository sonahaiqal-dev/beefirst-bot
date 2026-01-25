'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' 

export default function Home() {
  const [status, setStatus] = useState('Sedang mengecek koneksi...')

  useEffect(() => {
    const cekKoneksi = async () => {
      console.log("Mulai cek koneksi...")
      // Coba ambil data (pastikan tabel 'profiles' sudah dibuat di langkah SQL sebelumnya)
      const { data, error } = await supabase.from('profiles').select('*').limit(1)

      if (error) {
        console.error(error)
        setStatus('❌ Gagal Konek: ' + error.message)
      } else {
        setStatus('✅ BERHASIL KONEK KE SUPABASE!')
      }
    }

    cekKoneksi()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Test Koneksi Database
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-xl font-medium text-gray-800">
          Status: <span className={status.includes('BERHASIL') ? 'text-green-600' : 'text-red-600'}>{status}</span>
        </p>
      </div>
    </div>
  )
}