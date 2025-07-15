/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod',
  },
  // Internationalization configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
  },
  // Enable server components and improved caching
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['redis'],
  },
  // Improved performance with optimized bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Cache headers for improved performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  // Redirects for improved SEO
  async redirects() {
    return [
      {
        source: '/analyze',
        destination: '/analyzer',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 