'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('') // Buat nampilin error
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log("1. Cek User Login...")
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) { 
          console.log("User gak login, tendang ke login.")
          router.push('/login'); 
          return 
        }
        
        console.log("2. Cek Status Admin di Database...")
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (error) throw new Error("Gagal baca profil: " + error.message)

        if (!profile?.is_admin) {
          alert("⛔ Kamu bukan Admin! Hush sana!")
          router.push('/dashboard')
          return
        }

        console.log("3. User Valid! Ambil data semua user...")
        setCurrentUser(user)
        await fetchUsers(user.id) // Panggil fungsi fetch

      } catch (err: any) {
        console.error("ERROR FATAL:", err)
        setErrorMsg(err.message) // Tampilkan error di layar
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  const fetchUsers = async (adminId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_users', userId: adminId })
      })

      // Cek apakah API meledak (Bukan 200 OK)
      if (!res.ok) {
        const text = await res.text() // Baca error aslinya
        throw new Error(`API Error (${res.status}): ${text}`)
      }

      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      } else {
        throw new Error("Data user kosong dari API")
      }

    } catch (err: any) {
      console.error("Gagal Fetch Users:", err)
      setErrorMsg("Gagal ambil data: " + err.message)
    } finally {
      setLoading(false) // Wajib matikan loading apapun yang terjadi
    }
  }

  const updateUserStatus = async (targetId: string, newStatus: string) => {
    if(!confirm(`Yakin ubah user ini jadi ${newStatus}?`)) return

    try {
        const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'update_status', 
            userId: currentUser.id, 
            targetId: targetId,
            newStatus: newStatus
        })
        })
        
        const data = await res.json()
        if (data.success) {
            alert("✅ Status Berhasil Diubah!")
            fetchUsers(currentUser.id)
        } else {
            alert("❌ Gagal: " + data.error)
        }
    } catch (err: any) {
        alert("Error: " + err.message)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // TAMPILAN ERROR (Kalau ada error, muncul di sini)
  if (errorMsg) return (
    <div className="min-h-screen bg-gray-900 text-red-500 p-10 font-mono">
      <h1 className="text-2xl font-bold mb-4">☠️ ERROR TERDETEKSI</h1>
      <div className="bg-gray-800 p-4 rounded border border-red-800">
        {errorMsg}
      </div>
      <button onClick={() => window.location.reload()} className="mt-4 bg-white text-black px-4 py-2 rounded">Coba Refresh</button>
    </div>
  )

  if (loading) return <div className="p-10 text-center font-mono text-white">🕵️‍♂️ Memuat Data Rahasia... (Cek Console F12 kalau lama)</div>

  // ... (Sisa Return UI Tabel sama seperti sebelumnya)
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-500">ADMIN CONTROL ROOM 👮‍♂️</h1>
            <p className="text-gray-400">Panel Kontrol Owner</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">Kembali</button>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-900 text-gray-200 uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                        <div className="font-bold text-white">{user.email}</div>
                        <div className="text-xs">{user.store_name}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.subscription_status === 'premium' ? 'bg-blue-900 text-blue-300' : 'bg-yellow-900 text-yellow-300'}`}>
                            {user.subscription_status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        {user.subscription_status !== 'premium' ? (
                          <button onClick={() => updateUserStatus(user.id, 'premium')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">UPGRADE</button>
                        ) : (
                          <button onClick={() => updateUserStatus(user.id, 'trial')} className="bg-red-900 text-red-200 px-3 py-1 rounded text-xs">DOWNGRADE</button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}