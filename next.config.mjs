/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost', 'civicspace.sdnthailand.com', 'civicblogs12.blob.core.windows.net'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '3000',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'civicspace.sdnthailand.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'civicspace.sdnthailand.com',
        port: '',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'civicblogs12.blob.core.windows.net',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;