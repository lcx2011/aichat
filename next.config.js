/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // 不会在构建时因为ESLint错误而失败
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig; 