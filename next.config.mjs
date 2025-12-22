/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.1.186:3000",
    "http://christmasquiz.local:3000",
  ],
}

export default nextConfig
