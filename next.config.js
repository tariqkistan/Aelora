/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Exclude AWS infrastructure code from the build
  webpack: (config, { isServer }) => {
    // Add aws/ to exclude patterns
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...(config.watchOptions.ignored || []), '**/aws/**'],
    };
    return config;
  },
};

module.exports = nextConfig; 