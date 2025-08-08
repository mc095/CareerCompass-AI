import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'writelatex.s3.amazonaws.com',
        port: '',
        pathname: '/published_ver/**',
      },
      {
        protocol: 'https',
        hostname: 'writelatex.s3.amazonaws',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
