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
      // Serve background images and other static assets
      {
        source: '/bg2.png',
        destination: '/bg2.png',
      },
      {
        source: '/game-bg.png',
        destination: '/game-bg.png',
      },
      {
        source: '/game-bg1.png',
        destination: '/game-bg1.png',
      },
      {
        source: '/game-bg2.png',
        destination: '/game-bg2.png',
      },
      {
        source: '/vite.svg',
        destination: '/vite.svg',
      },
      // Generic rule for other static assets
      {
        source: '/:path*.png',
        destination: '/:path*.png',
      },
      {
        source: '/:path*.svg',
        destination: '/:path*.svg',
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

export default nextConfig;