import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* === NAVBAR === */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-gray-900/80">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter cursor-default">
          <span className="bg-blue-600 p-1 rounded-lg text-xl">🐝</span>
          <span>BeeFirst.</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="hidden md:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
            Masuk Member
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition shadow-lg hover:shadow-white/20 transform hover:-translate-y-0.5">
            Daftar Gratis 🚀
          </Link>
        </div>
      </nav>

      {/* === HERO SECTION (Bagian Utama) === */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        
        {/* Badge Kecil */}
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-xs font-bold tracking-wide uppercase animate-fade-in-up">
          ✨ Bot WhatsApp Paling Cerdas v1.0
        </div>
        
        {/* Headline Besar */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-tight">
          Bikin CS WhatsApp <br className="hidden md:block" />
          <span className="text-blue-500">Otomatis & Pintar</span>
        </h1>
        
        {/* Sub-Headline */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Balas ribuan chat customer dalam hitungan detik pakai AI. 
          Tanpa begadang, tanpa gaji admin, aktif 24 jam nonstop cari cuan buat kamu.
        </p>

        {/* Tombol CTA (Call to Action) */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transform hover:scale-105">
            Coba Gratis Sekarang ⚡
          </Link>
          <Link href="/login" className="w-full md:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-lg transition flex items-center justify-center">
            Login Dashboard 🔐
          </Link>
        </div>

        {/* === FEATURE GRID (Kotak Fitur) === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          
          {/* Kartu 1: AI */}
          <div className="p-6 bg-gray-800/40 border border-gray-700 rounded-2xl hover:border-blue-500/50 transition duration-300 hover:bg-gray-800/60 group">
            <div className="text-4xl mb-4 bg-gray-900 w-fit p-3 rounded-xl border border-gray-700 group-hover:border-blue-500/30 transition">🧠</div>
            <h3 className="text-xl font-bold mb-2 text-white">Otak AI Cerdas</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bukan sekadar bot keyword kaku. Bot ini mengerti konteks jualanmu dan menjawab natural seperti manusia sungguhan.
            </p>
          </div>

          {/* Kartu 2: Broadcast */}
          <div className="p-6 bg-gray-800/40 border border-gray-700 rounded-2xl hover:border-purple-500/50 transition duration-300 hover:bg-gray-800/60 group">
            <div className="text-4xl mb-4 bg-gray-900 w-fit p-3 rounded-xl border border-gray-700 group-hover:border-purple-500/30 transition">📡</div>
            <h3 className="text-xl font-bold mb-2 text-white">Smart Broadcast</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kirim promo ke ribuan kontak tanpa takut di-banned. Dilengkapi fitur Spintax (acak kata) dan Delay otomatis.
            </p>
          </div>

          {/* Kartu 3: Statistik */}
          <div className="p-6 bg-gray-800/40 border border-gray-700 rounded-2xl hover:border-green-500/50 transition duration-300 hover:bg-gray-800/60 group">
            <div className="text-4xl mb-4 bg-gray-900 w-fit p-3 rounded-xl border border-gray-700 group-hover:border-green-500/30 transition">📊</div>
            <h3 className="text-xl font-bold mb-2 text-white">Statistik Real-time</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pantau kinerja botmu. Lihat berapa banyak chat yang dijawab dan berapa jam waktu kerjamu yang berhasil dihemat.
            </p>
          </div>

        </div>

      </main>

      {/* === FOOTER === */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm bg-gray-900/50">
        <p>&copy; {new Date().getFullYear()} BeeFirst Bot. Dibuat dengan ☕ & Koding.</p>
      </footer>
    </div>
  )
}