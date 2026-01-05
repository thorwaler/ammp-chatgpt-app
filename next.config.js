/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },

  // Environment variables
  env: {
    AMMP_BASE_URL: process.env.AMMP_BASE_URL || 'https://data-api.ammp.io',
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/mcp',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Mcp-Session-Id',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Mcp-Session-Id',
          },
        ],
      },
    ];
  },

  // Optimize for production
  swcMinify: true,
  
  // Output configuration for Vercel
  output: 'standalone',
};

export default nextConfig;
