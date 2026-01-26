'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.push('/dashboard'); return }

      setCurrentUser(user)
      fetchUsers(user.id)
    }
    checkAdmin()
  }, [])

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

  const handleSubscription = async (targetId: string, status: string) => {
    if(!confirm(`Ubah status jadi ${status}?`)) return
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', userId: currentUser.id, targetId, newStatus: status })
    })
    fetchUsers(currentUser.id)
  }

  const handleBan = async (targetId: string, currentStatus: boolean) => {
    const msg = currentStatus ? "Buka Blokir (Un-Ban) user ini?" : "⚠️ BANNED user ini? Bot dia akan mati total."
    if(!confirm(msg)) return
    
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_ban', userId: currentUser.id, targetId })
    })
    fetchUsers(currentUser.id)
  }

  // Hitung sisa hari
  const getDaysLeft = (dateStr: string) => {
    const end = new Date(dateStr).getTime()
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24))
    return diff > 0 ? `${diff} Hari Lagi` : 'EXPIRED'
  }

  if (loading) return <div className="p-10 text-center text-white bg-gray-900 min-h-screen">⏳ Mengambil Data User...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ADMIN DASHBOARD</h1>
            <p className="text-gray-400 text-sm">Total Pengguna: {users.length} Orang</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm border border-gray-600">⬅️ Dashboard</button>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">User / Toko</th>
                  <th className="px-6 py-4">Data Bot</th>
                  <th className="px-6 py-4">Status & Sisa Waktu</th>
                  <th className="px-6 py-4 text-center">Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-750 transition ${user.is_banned ? 'bg-red-900/20' : ''}`}>
                    
                    {/* KOLOM 1: IDENTITAS */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {user.email}
                        {user.is_admin && <span className="bg-purple-600 text-xs px-1 rounded">OWNER</span>}
                        {user.is_banned && <span className="bg-red-600 text-xs px-2 rounded animate-pulse">🚫 BANNED</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Join: {new Date(user.created_at).toLocaleDateString()}</div>
                    </td>

                    {/* KOLOM 2: DATA TOKO */}
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{user.store_name || '(Belum set nama)'}</div>
                      <div className="text-xs text-gray-500">{user.store_phone || '-'}</div>
                      <div className={`text-[10px] mt-1 px-2 py-0.5 rounded w-fit ${user.fonnte_token ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                        {user.fonnte_token ? 'Token OK ✅' : 'Token Kosong ⚠️'}
                      </div>
                    </td>

                    {/* KOLOM 3: SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          user.subscription_status === 'premium' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-black'
                        }`}>
                          {user.subscription_status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs font-mono mt-1 text-gray-400">
                        {getDaysLeft(user.trial_ends_at)}
                      </div>
                    </td>

                    {/* KOLOM 4: TOMBOL AKSI */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 items-center">
                        {/* Tombol Upgrade/Downgrade */}
                        {user.subscription_status !== 'premium' ? (
                          <button onClick={() => handleSubscription(user.id, 'premium')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs">⬆️ Premium</button>
                        ) : (
                          <button onClick={() => handleSubscription(user.id, 'trial')} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs">⬇️ Trial</button>
                        )}

                        {/* Tombol BANNED */}
                        <button 
                          onClick={() => handleBan(user.id, user.is_banned)} 
                          className={`px-3 py-1 rounded text-xs font-bold border transition ${user.is_banned ? 'bg-gray-600 border-gray-500' : 'bg-transparent border-red-500 text-red-500 hover:bg-red-900'}`}
                        >
                          {user.is_banned ? '🔓 UNBAN' : '🚫 BAN'}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}