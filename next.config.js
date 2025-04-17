/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during builds
  eslint: {
    // Warning instead of error during builds
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // If client-side, don't include mongodb modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'fs/promises': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
