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
  // Exclude AWS directories from the build
  webpack: (config, { isServer }) => {
    // Exclude the aws directory from the build
    config.externals = [...(config.externals || []), { 'aws-cdk-lib': 'aws-cdk-lib' }];
    return config;
  },
  // Add directories that should be excluded from the build
  experimental: {
    outputFileTracingExcludes: {
      '*': ['aws/**/*'],
    },
  },
};

module.exports = nextConfig; 