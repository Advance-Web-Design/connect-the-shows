/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
  async rewrites() {
    return [
      // Serve client assets (JS/CSS from Vite build) FIRST
      {
        source: '/assets/:path*',
        destination: '/client/assets/:path*',
      },
      {
        source: '/src/:path*',
        destination: '/client/src/:path*',
      },
      // Serve client app ONLY for exact root path (not catch-all)
      {
        source: '/',
        destination: '/client/index.html',
      }
      // Remove the catch-all that was intercepting image requests
    ];
  },
  // Ensure static files are served properly
  async headers() {
    return [
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
    ];
  },
};

export default nextConfig;