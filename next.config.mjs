/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ne PAS utiliser output: 'export' pour permettre le rendu dynamique
  images: {
    // Netlify ne fournit pas /_next/image avec Next 16 : on sert les fichiers tels quels.
    unoptimized: true,
    // Next 16 passe le défaut de 60s à 4h : on conserve le comportement Next 14.
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dzairbox.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  serverExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  async redirects() {
    return [
      { source: '/create-service', destination: '/onboarding', permanent: true },
    ]
  },
};

export default nextConfig;
