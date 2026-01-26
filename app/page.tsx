import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">BeeFirst Bot 🐝</div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Masuk</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Bikin Bot WhatsApp AI <br/>
          <span className="text-blue-600">Tanpa Coding</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Otomatiskan Customer Service bisnis kamu dengan kecerdasan buatan. 
          Bisa setting kepribadian bot sesuka hati. Aktif 24 jam nonstop.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            Mulai Trial 7 Hari 🚀
          </Link>
          <a href="#fitur" className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition">
            Pelajari Dulu
          </a>
        </div>
      </header>

      {/* FITUR SECTION */}
      <section id="fitur" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Kenapa Pilih BeeFirst?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fitur 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Otak AI Cerdas</h3>
              <p className="text-gray-600">Bukan bot keyword biasa. Bot ini mengerti bahasa manusia dan bisa menjawab pertanyaan rumit.</p>
            </div>
            {/* Fitur 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Custom Kepribadian</h3>
              <p className="text-gray-600">Mau jadi CS ramah? Atau pelayan Warteg medok? Kamu yang atur sendiri prompt-nya.</p>
            </div>
            {/* Fitur 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Setup 5 Menit</h3>
              <p className="text-gray-600">Daftar, Masukkan Token WA, Setting Prompt, Selesai! Bot langsung jalan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SIMPLE */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Siap Menghemat Waktu Kamu?</h2>
          <p className="text-blue-100 mb-8 text-lg">Bergabung dengan pebisnis cerdas lainnya. Coba gratis dulu, bayar nanti kalau suka.</p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition">
            Buat Akun Sekarang ➡️
          </Link>
          <p className="mt-4 text-sm text-blue-200 opacity-80">Tanpa kartu kredit. Langsung aktif.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>&copy; 2026 BeeFirst Bot. All rights reserved.</p>
      </footer>

    </div>
  )
}