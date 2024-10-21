/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ssnthailand.com',
          port: '',
          pathname: '/images/**',
        },
        {
          protocol: 'https',
          hostname: 'ssnthailand.com/auth/signin',
          port: '',
          pathname: '/img/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  