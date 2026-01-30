'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AksesKamiPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      // Cek apakah user adalah admin
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
    checkAccess()
  }, [])

  const fetchUsers = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/akses-kami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_users', userId: userId })
      })
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      alert('Gagal mengambil data sistem.')
    }
    setLoading(false)
  }

  // --- LOGIKA GANTI PAKET (TIER) ---
  const handleChangeTier = async (targetId: string, newTier: string) => {
    // Update tampilan dulu biar cepat (Optimistic UI)
    setUsers(prev => prev.map(u => u.id === targetId ? { ...u, tier: newTier } : u))

    // Kirim ke database
    await fetch('/api/akses-kami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'update_tier', 
            userId: currentUser.id, 
            targetId: targetId,
            newTier: newTier
        })
    })
  }

  const handleSetToken = async (targetId: string, currentToken: string) => {
    const newToken = prompt("Masukkan Token Fonnte Baru:", currentToken || "")
    if (newToken === null) return 
    
    await fetch('/api/akses-kami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'update_token', 
            userId: currentUser.id, 
            targetId: targetId,
            token: newToken
        })
    })
    fetchUsers(currentUser.id)
  }

  const handleBan = async (targetId: string, currentStatus: boolean) => {
    if(!confirm(currentStatus ? "Buka Blokir User Ini?" : "⚠️ BEKUKAN (BAN) User Ini?")) return
    
    await fetch('/api/akses-kami', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_ban', userId: currentUser.id, targetId })
    })
    fetchUsers(currentUser.id)
  }

  const handleDeleteUser = async (targetId: string, email: string) => {
    if (!confirm(`⚠️ HAPUS PERMANEN DATA ${email}?\nData tidak bisa dikembalikan!`)) return
    if (!confirm("Ketik OK untuk konfirmasi terakhir.")) return

    const res = await fetch('/api/akses-kami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId: currentUser.id, targetId })
    })
    
    if (res.ok) {
        alert("✅ Data berhasil dimusnahkan.")
        fetchUsers(currentUser.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Fungsi Warna Badge untuk Dropdown Paket
  const getTierColor = (tier: string) => {
    switch(tier) {
        case 'ultimate': return 'bg-purple-900 text-purple-200 border-purple-600 focus:ring-purple-500' // Sultan
        case 'premium': return 'bg-blue-900 text-blue-200 border-blue-600 focus:ring-blue-500' // Menengah
        default: return 'bg-gray-800 text-gray-400 border-gray-600 focus:ring-gray-500' // Starter
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-gray-500 font-mono">Memuat Sistem Akses Kami...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER RAHASIA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-wide">AKSES KAMI</h1>
            <p className="text-gray-500 text-sm mt-1">Sistem Manajemen User & Paket</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition border border-gray-700">Dashboard</button>
            <button onClick={handleLogout} className="bg-red-900/30 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded text-sm transition border border-red-900">Keluar</button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-950 text-gray-500 uppercase text-xs font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">Data Klien</th>
                  <th className="px-6 py-4">Paket Langganan 📦</th>
                  <th className="px-6 py-4">Koneksi WA</th>
                  <th className="px-6 py-4 text-center">Status Akun</th>
                  <th className="px-6 py-4 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition">
                    
                    {/* INFO CLIENT */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">{user.store_name || '(Tanpa Nama Toko)'}</div>
                      <div className="text-[10px] text-blue-400 font-mono mt-1">{user.whatsapp || '-'}</div>
                    </td>

                    {/* PILIHAN PAKET (TIER) */}
                    <td className="px-6 py-4">
                        <select 
                            value={user.tier || 'starter'} 
                            onChange={(e) => handleChangeTier(user.id, e.target.value)}
                            className={`text-xs font-bold uppercase py-2 px-3 rounded border outline-none cursor-pointer transition appearance-none w-full ${getTierColor(user.tier || 'starter')}`}
                        >
                            <option value="starter">Starter (Basic)</option>
                            <option value="premium">Premium (Image)</option>
                            <option value="ultimate">Ultimate (Midtrans)</option>
                        </select>
                    </td>

                    {/* TOKEN WA */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${user.fonnte_token ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-mono">{user.fonnte_token ? 'ON' : 'OFF'}</span>
                      </div>
                      <button onClick={() => handleSetToken(user.id, user.fonnte_token)} className="text-[10px] bg-gray-800 border border-gray-700 px-3 py-1 rounded hover:bg-white hover:text-black transition w-full">
                         🔑 Set Token
                      </button>
                    </td>

                    {/* STATUS AKUN (BAN/UNBAN) */}
                    <td className="px-6 py-4 text-center">
                        <button 
                            onClick={() => handleBan(user.id, user.is_banned)} 
                            className={`text-[10px] border px-3 py-1.5 rounded transition font-bold ${user.is_banned ? 'border-red-500 text-red-500 hover:bg-red-900' : 'border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {user.is_banned ? '🚫 SEDANG DIBEKUKAN' : '✅ AKTIF'}
                        </button>
                    </td>

                    {/* HAPUS PERMANEN */}
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteUser(user.id, user.email)} className="bg-red-900/10 text-red-500 p-2.5 rounded hover:bg-red-600 hover:text-white transition border border-red-900/30" title="Hapus Permanen">
                            🗑️
                        </button>
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