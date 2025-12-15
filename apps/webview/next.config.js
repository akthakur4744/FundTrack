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
};

module.exports = nextConfig;
