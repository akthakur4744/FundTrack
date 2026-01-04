/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure for WebView embedding
  compress: true,
  poweredByHeader: false,
  // Optimize images
  images: {
    unoptimized: true,
  },
  // Disable static generation entirely - all pages will be SSR
  experimental: {
    // This allows us to avoid static generation errors
  },
};

module.exports = nextConfig;
