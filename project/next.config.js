/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Handle font loading issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Font-Loading',
            value: 'swap',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;