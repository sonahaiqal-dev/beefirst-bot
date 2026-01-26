'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  // 1. Cek Apakah Admin?
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      // Cek status admin di database
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        alert("⛔ STOP! Halaman ini khusus Owner.")
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      fetchUsers(user.id)
    }
    checkAdmin()
  }, [])

  // 2. Ambil Daftar User via API
  const fetchUsers = async (adminId: string) => {
    setLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fetch_users', userId: adminId })
    })
    const data = await res.json()
    if (data.users) setUsers(data.users)
    setLoading(false)
  }

  // 3. Fungsi Upgrade/Downgrade User
  const updateUserStatus = async (targetId: string, newStatus: string) => {
    if(!confirm(`Yakin ubah user ini jadi ${newStatus}?`)) return

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
      fetchUsers(currentUser.id) // Refresh tabel
    } else {
      alert("❌ Gagal: " + data.error)
    }
  }

  // Format Tanggal biar enak dibaca
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return <div className="p-10 text-center font-mono">🕵️‍♂️ Memuat Data Rahasia...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-500">ADMIN CONTROL ROOM 👮‍♂️</h1>
            <p className="text-gray-400">Kelola semua user BeeFirst dari sini.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
            ⬅️ Kembali ke Dashboard
          </button>
        </div>

        {/* TABEL USER */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-900 text-gray-200 uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">Toko / HP</th>
                  <th className="px-6 py-4">Status Langganan</th>
                  <th className="px-6 py-4">Expired</th>
                  <th className="px-6 py-4 text-center">AKSI OWNER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition">
                    
                    {/* INFO USER */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{user.email}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{user.id}</div>
                    </td>

                    {/* INFO TOKO */}
                    <td className="px-6 py-4">
                      <div className="text-white">{user.store_name || '-'}</div>
                      <div className="text-xs">{user.store_phone || '-'}</div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.subscription_status === 'premium' ? 'bg-blue-900 text-blue-300 border border-blue-700' : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                      }`}>
                        {user.subscription_status.toUpperCase()}
                      </span>
                      {!user.is_active && <span className="ml-2 text-xs text-red-500 font-bold">(BOT MATI)</span>}
                    </td>

                    {/* EXPIRED */}
                    <td className="px-6 py-4 font-mono text-white">
                      {formatDate(user.trial_ends_at)}
                    </td>

                    {/* TOMBOL AKSI */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {user.subscription_status !== 'premium' ? (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'premium')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold shadow transition"
                          >
                            🚀 UPGRADE PREMIUM
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'trial')}
                            className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-xs font-bold border border-red-800 transition"
                          >
                            ⬇️ DOWNGRADE
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
             <div className="p-10 text-center text-gray-500">Belum ada user yang daftar bos.</div>
          )}
        </div>

      </div>
    </div>
  )
}