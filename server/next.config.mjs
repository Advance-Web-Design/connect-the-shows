/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static files are served correctly
  trailingSlash: false,
  async rewrites() {
    return [
      // Serve client app
      {
        source: '/',
        destination: '/client/index.html',
      },
      // Serve client assets
      {
        source: '/src/:path*',
        destination: '/client/src/:path*',
      },
      {
        source: '/assets/:path*',
        destination: '/client/assets/:path*',
      }
    ];
  },
};

module.exports = nextConfig;