/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      // Serve client app
      {
        source: '/',
        destination: '/client/index.html',
      },
      // Serve client assets (JS/CSS from Vite build)
      {
        source: '/src/:path*',
        destination: '/client/src/:path*',
      },
      {
        source: '/assets/:path*',
        destination: '/client/assets/:path*',
      }
      // Images will be served automatically from /public/ root
    ];
  },
};

export default nextConfig;