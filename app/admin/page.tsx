export default function AdminTrap() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">👀</h1>
      <h2 className="text-xl md:text-3xl font-mono text-red-500 font-bold tracking-widest uppercase">
        Hayo, kamu cari apa?
      </h2>
      <p className="text-gray-600 mt-4 text-sm font-mono">
        Access Denied. IP Address Logged.
      </p>
    </div>
  )
}