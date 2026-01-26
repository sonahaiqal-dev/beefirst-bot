/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! PERINGATAN !!
    // Ini membolehkan build selesai meski ada error TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ini membolehkan build selesai meski ada warning ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;