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
      // PERHATIKAN: Fetch ke API baru
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

  const handleSubscription = async (targetId: string, status: string) => {
    if(!confirm(`Ubah status jadi ${status.toUpperCase()}?`)) return
    await fetch('/api/akses-kami', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', userId: currentUser.id, targetId, newStatus: status })
    })
    fetchUsers(currentUser.id)
  }

  const handleBan = async (targetId: string, currentStatus: boolean) => {
    const msg = currentStatus ? "Buka Akses user ini?" : "⚠️ NON-AKTIFKAN (Bekukan) user ini?"
    if(!confirm(msg)) return
    await fetch('/api/akses-kami', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_ban', userId: currentUser.id, targetId })
    })
    fetchUsers(currentUser.id)
  }

  const handleSetToken = async (targetId: string, currentToken: string) => {
    const newToken = prompt("Masukkan Token Fonnte untuk User ini:", currentToken || "")
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
    alert("✅ Token berhasil disimpan!")
    fetchUsers(currentUser.id)
  }

  const handleDeleteUser = async (targetId: string, email: string) => {
    if (!confirm(`⚠️ Yakin HAPUS PERMANEN data ${email}?`)) return
    if (!confirm("Ketik OK untuk konfirmasi.")) return

    try {
        const res = await fetch('/api/akses-kami', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'delete_user', 
                userId: currentUser.id, 
                targetId: targetId
            })
        })
        
        if (res.ok) {
            alert("✅ Data dihapus.")
            fetchUsers(currentUser.id)
        } else {
            alert("Gagal menghapus.")
        }
    } catch (err) {
        alert("Error sistem.")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-gray-500 font-mono">Memuat Akses Kami...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-wide">AKSES KAMI</h1>
            <p className="text-gray-500 text-sm mt-1">Hidden Control Panel</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition border border-gray-700">Dashboard</button>
            <button onClick={handleLogout} className="bg-red-900/30 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded text-sm transition border border-red-900">Keluar</button>
          </div>
        </div>

        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-950 text-gray-500 uppercase text-xs font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">Data Klien</th>
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                  <th className="px-6 py-4 text-center">Danger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">{user.store_name}</div>
                      <div className="text-[10px] text-blue-400 mt-1 font-mono">{user.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleSetToken(user.id, user.fonnte_token)} className="text-[10px] bg-gray-800 border border-gray-700 px-3 py-1 rounded hover:bg-blue-900 hover:text-white transition">
                         {user.fonnte_token ? '✅ Ganti Token' : '🔑 Input Token'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.subscription_status === 'premium' ? 'bg-blue-900/50 text-blue-300' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {user.subscription_status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                        <button onClick={() => handleSubscription(user.id, user.subscription_status === 'premium' ? 'trial' : 'premium')} className="text-[10px] border border-gray-700 px-2 py-1 rounded">⬆️/⬇️</button>
                        <button onClick={() => handleBan(user.id, user.is_banned)} className="text-[10px] border border-gray-700 px-2 py-1 rounded text-red-400">🚫</button>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteUser(user.id, user.email)} className="bg-red-900/20 text-red-500 p-2 rounded hover:bg-red-600 hover:text-white transition">🗑️</button>
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