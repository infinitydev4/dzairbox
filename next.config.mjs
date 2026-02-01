/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ne PAS utiliser output: 'export' pour permettre le rendu dynamique
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'dzairbox.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '**',
      }
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
