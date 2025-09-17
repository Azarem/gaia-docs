import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 4,
  },
};

export default nextConfig;
