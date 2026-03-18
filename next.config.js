/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Remove deprecated appDir option - it's now default in Next.js 14
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer }) => {
    // Fix for Firebase Auth in webpack 5
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Handle undici module issues
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('undici');
    }
    
    return config;
  },
  // Skip Google Fonts optimization to avoid certificate issues
  optimizeFonts: false,
}

module.exports = nextConfig