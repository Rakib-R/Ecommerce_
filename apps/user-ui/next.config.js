//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {

  reactStrictMode: false,
  nx: {
    svgr: false,
  },

  output: 'standalone', // FOR PROD IN RAILWAY
  
  // ✅ ADD THIS SECTION to suppress hydration warnings
  /** @param {any} error */
  onError: (error) => {
    // Suppress Codeium extension hydration warnings
    if (error.message && error.message.includes('cz-shortcut-listen')) {
      return;
    }
    // Re-throw other errors
    throw error;
  },
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
    ],
  },
  
  images: {
    unoptimized: process.env.NODE_ENV === 'production' ? false : true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const plugins = [
  withNx,
  withBundleAnalyzer,
];

module.exports = composePlugins(...plugins)(nextConfig);