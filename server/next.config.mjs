/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Firebase to reduce bundle size
      config.externals.push('firebase/app', 'firebase/firestore');
    }
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
};

export default nextConfig;