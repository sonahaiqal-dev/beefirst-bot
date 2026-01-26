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
      
      // Cek apakah user ini admin?
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      fetchUsers(user.id)
    }
    checkAdmin()
  }, [])

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

  const handleSubscription = async (targetId: string, status: string) => {
    if(!confirm(`Ubah status jadi ${status.toUpperCase()}?`)) return
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', userId: currentUser.id, targetId, newStatus: status })
    })
    fetchUsers(currentUser.id)
  }

  const handleBan = async (targetId: string, currentStatus: boolean) => {
    const msg = currentStatus ? "Buka Blokir user ini?" : "⚠️ BANNED user ini?"
    if(!confirm(msg)) return
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_ban', userId: currentUser.id, targetId })
    })
    fetchUsers(currentUser.id)
  }

  // === FUNGSI SET TOKEN MANUAL ===
  const handleSetToken = async (targetId: string, currentToken: string) => {
    const newToken = prompt("Masukkan Token Fonnte untuk User ini:", currentToken || "")
    
    // Kalau user klik Cancel atau kosongin input
    if (newToken === null) return 
    
    await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'update_token', 
            userId: currentUser.id, 
            targetId: targetId,
            token: newToken
        })
    })
    alert("✅ Token berhasil disimpan!")
    fetchUsers(currentUser.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-gray-500 font-mono">Loading Data Admin...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Control Panel</h1>
            <p className="text-gray-500 text-sm">Total Pengguna: {users.length} User</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition border border-gray-700">
              Lihat Dashboard Saya
            </button>
            <button onClick={handleLogout} className="bg-red-900/30 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded text-sm transition border border-red-900">
              Keluar
            </button>
          </div>
        </div>

        {/* TABEL USER */}
        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-950 text-gray-500 uppercase text-xs font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">User & Toko</th>
                  <th className="px-6 py-4">Koneksi WA</th>
                  <th className="px-6 py-4">Langganan</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition duration-150">
                    
                    {/* KOLOM 1: INFO USER */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">{user.store_name || '(Belum set nama)'}</div>
                      {user.is_banned && <span className="text-red-500 text-[10px] font-bold border border-red-900 px-1 rounded mt-1 inline-block">BANNED</span>}
                    </td>

                    {/* KOLOM 2: TOKEN & KONEKSI */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${user.fonnte_token ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-mono">{user.fonnte_token ? 'Terhubung' : 'Token Kosong'}</span>
                      </div>
                      
                      {/* TOMBOL INPUT TOKEN (INITI BARU) */}
                      <button 
                        onClick={() => handleSetToken(user.id, user.fonnte_token)}
                        className="text-[10px] bg-gray-800 hover:bg-blue-900 hover:text-blue-100 text-gray-300 px-3 py-1.5 rounded border border-gray-700 hover:border-blue-500 transition flex items-center gap-1 w-full justify-center"
                      >
                        🔑 {user.fonnte_token ? 'Ganti Token' : 'Input Token'}
                      </button>
                    </td>

                    {/* KOLOM 3: SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                        user.subscription_status === 'premium' ? 'bg-blue-900/50 text-blue-300 border border-blue-800' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-900'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>

                    {/* KOLOM 4: ACTIONS */}
                    <td className="px-6 py-4 text-center space-x-3">
                        <button onClick={() => handleSubscription(user.id, user.subscription_status === 'premium' ? 'trial' : 'premium')} className="text-xs text-blue-400 hover:text-white transition decoration-blue-500/30 underline underline-offset-4">
                            {user.subscription_status === 'premium' ? 'Downgrade' : 'Upgrade'}
                        </button>
                        
                        <button onClick={() => handleBan(user.id, user.is_banned)} className="text-xs text-red-500 hover:text-red-300 transition decoration-red-500/30 underline underline-offset-4">
                            {user.is_banned ? 'Buka Blokir' : 'Blokir User'}
                        </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
                <div className="p-8 text-center text-gray-600 italic">Belum ada user yang mendaftar.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}