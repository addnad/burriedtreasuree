/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    // Exclude test files and Anchor-generated types from build
    config.resolve.alias = {
      ...config.resolve.alias,
      '../target/types/buried_treasure': false,
      './target/types/buried_treasure': false,
    };
    return config;
  },
  // Exclude test files from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;
