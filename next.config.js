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
  // Environment variables that will be available at build time
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod',
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