'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  // 1. Cek Keamanan (Hanya Admin Boleh Masuk)
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
        // Kalau bukan admin, tendang ke dashboard biasa
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      fetchUsers(user.id)
    }
    checkAdmin()
  }, [])

  // 2. Ambil Data Semua User
  const fetchUsers = async (adminId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_users', userId: adminId })
      })
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      alert('Gagal mengambil data user.')
    }
    setLoading(false)
  }

  // 3. Fungsi Upgrade/Downgrade Paket
  const handleSubscription = async (targetId: string, status: string) => {
    if(!confirm(`Yakin ubah status user ini jadi ${status.toUpperCase()}?`)) return
    
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', userId: currentUser.id, targetId, newStatus: status })
    })
    
    // Refresh data setelah update
    fetchUsers(currentUser.id)
  }

  // 4. Fungsi Banned / Un-Banned User
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

  // 5. Fungsi Logout (Keluar Sistem)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Helper: Hitung sisa hari
  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return '-'
    const end = new Date(dateStr).getTime()
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24))
    return diff > 0 ? `${diff} Hari Lagi` : 'EXPIRED ❌'
  }

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white font-mono">⏳ Mengambil Data Rahasia...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ADMIN CONTROL ROOM 👮‍♂️</h1>
            <p className="text-gray-400 text-sm mt-1">Total Pengguna: <span className="text-white font-bold">{users.length} Orang</span></p>
          </div>
          
          <div className="flex gap-3">
            {/* Tombol Balik ke Dashboard (Buat ngurus bot sendiri) */}
            <button 
              onClick={() => router.push('/dashboard')} 
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-600 transition font-medium"
            >
              ⬅️ Dashboard Saya
            </button>

            {/* Tombol Logout (NEW) 🚪 */}
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition flex items-center gap-2"
            >
              Keluar 🚪
            </button>
          </div>
        </div>

        {/* TABEL DATA USER */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">User / Toko</th>
                  <th className="px-6 py-4">Status Bot</th>
                  <th className="px-6 py-4">Langganan</th>
                  <th className="px-6 py-4 text-center">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-750 transition ${user.is_banned ? 'bg-red-900/20' : ''}`}>
                    
                    {/* KOLOM 1: IDENTITAS */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {user.email}
                        {user.is_admin && <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">OWNER</span>}
                        {user.is_banned && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">BANNED</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">ID: {user.id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-gray-500">Join: {new Date(user.created_at).toLocaleDateString()}</div>
                    </td>

                    {/* KOLOM 2: DATA TOKO */}
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{user.store_name || '(Belum set nama)'}</div>
                      <div className="text-xs text-gray-500 mb-1">{user.store_phone || '-'}</div>
                      
                      <div className="flex gap-2">
                         {/* Indikator Token */}
                        <div className={`text-[10px] px-2 py-0.5 rounded w-fit font-bold ${user.fonnte_token ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                            {user.fonnte_token ? 'Token OK' : 'No Token'}
                        </div>
                         {/* Indikator Saklar */}
                         <div className={`text-[10px] px-2 py-0.5 rounded w-fit font-bold ${user.is_active ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>
                            {user.is_active ? 'Bot ON' : 'Bot OFF'}
                        </div>
                      </div>
                    </td>

                    {/* KOLOM 3: SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.subscription_status === 'premium' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-black'
                      }`}>
                        {user.subscription_status.toUpperCase()}
                      </span>
                      <div className={`text-xs font-mono mt-2 font-bold ${getDaysLeft(user.trial_ends_at).includes('EXPIRED') ? 'text-red-400' : 'text-green-400'}`}>
                        ⏳ {getDaysLeft(user.trial_ends_at)}
                      </div>
                    </td>

                    {/* KOLOM 4: TOMBOL AKSI */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex gap-2">
                            {/* Tombol Upgrade/Downgrade */}
                            {user.subscription_status !== 'premium' ? (
                            <button onClick={() => handleSubscription(user.id, 'premium')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-[10px] font-bold shadow transition w-20">
                                ⬆️ UPGRADE
                            </button>
                            ) : (
                            <button onClick={() => handleSubscription(user.id, 'trial')} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 rounded text-[10px] font-bold shadow transition w-20">
                                ⬇️ TRIAL
                            </button>
                            )}
                        </div>

                        {/* Tombol BANNED */}
                        <button 
                          onClick={() => handleBan(user.id, user.is_banned)} 
                          className={`px-3 py-1 rounded text-[10px] font-bold border transition w-20 ${user.is_banned ? 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500' : 'bg-transparent border-red-500 text-red-500 hover:bg-red-900 hover:text-white'}`}
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
          
          {/* State Kosong */}
          {users.length === 0 && (
             <div className="p-10 text-center text-gray-500">Belum ada user yang daftar bos.</div>
          )}
        </div>

      </div>
    </div>
  )
}