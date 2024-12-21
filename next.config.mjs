/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'database.ssnthailand.com', // แก้ไขจาก ssnthailand.com
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'database.ssnthailand.com/auth/signin', // แก้ไขจาก ssnthailand.com/auth/signin
        port: '',
        pathname: '/img/**',
      },
    ],
  },
};

export default nextConfig;