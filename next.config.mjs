/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  basePath: '',
  experimental: {
    appDir: false,
  }
}

export default nextConfig;
