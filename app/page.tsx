import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-50">
        <div className="text-xl font-semibold tracking-tight text-white">
          BeeFirst.
        </div>
        <div className="flex gap-6 items-center text-sm">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-200">
            Masuk
          </Link>
          <Link href="/register" className="bg-white text-black px-5 py-2 rounded font-medium hover:bg-gray-200 transition-colors duration-200">
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
        
        <div className="inline-block mb-8 px-3 py-1 border border-gray-800 rounded text-gray-400 text-xs tracking-widest uppercase">
          Versi 1.0 — Automasi Bisnis
        </div>
        
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-8 text-white leading-tight">
          Otomatisasi layanan pelanggan <br />
          tanpa kompromi.
        </h1>
        
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed font-light">
          Tingkatkan respon bisnis Anda dengan asisten WhatsApp berbasis AI. 
          Aktif 24 jam untuk menjawab pertanyaan pelanggan secara natural dan akurat.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="w-full md:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded font-medium transition-all duration-200">
            Coba Gratis 7 Hari
          </Link>
          <Link href="/login" className="w-full md:w-auto px-8 py-3 bg-transparent border border-gray-800 hover:border-gray-600 text-gray-300 rounded font-medium transition-all duration-200">
            Masuk Dashboard
          </Link>
        </div>

        {/* FEATURES - Minimalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          
          <div className="p-6 border-t border-gray-800 hover:border-blue-800 transition duration-500">
            <h3 className="text-lg font-medium text-white mb-3">Respon Kontekstual</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sistem tidak menggunakan kata kunci kaku, melainkan memahami konteks percakapan untuk jawaban yang lebih manusiawi.
            </p>
          </div>

          <div className="p-6 border-t border-gray-800 hover:border-blue-800 transition duration-500">
            <h3 className="text-lg font-medium text-white mb-3">Siaran Pintar</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Kirim pesan massal dengan variasi teks otomatis (Spintax) dan pengaturan jeda waktu untuk keamanan nomor Anda.
            </p>
          </div>

          <div className="p-6 border-t border-gray-800 hover:border-blue-800 transition duration-500">
            <h3 className="text-lg font-medium text-white mb-3">Analitik Data</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Pantau volume interaksi dan efisiensi waktu yang berhasil dihemat melalui dashboard yang terintegrasi.
            </p>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-xs tracking-wide uppercase">
        <p>&copy; {new Date().getFullYear()} BeeFirst Systems. All Rights Reserved.</p>
      </footer>
    </div>
  )
}