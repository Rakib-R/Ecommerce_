//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  reactStrictMode: true,
  nx: {
    svgr: false,
  },

  output: 'standalone',

  // ✅ ADD THIS SECTION to suppress hydration warnings
  /** @param {any} error */
  // todo USE Suppression Hydration in Layout.jsx for -> cz-shortcut-listen

  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'production' ? false : true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
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
    config.ignoreWarnings = [
      { module: /node_modules\/@prisma\/client/ },
      /Failed to parse source map/,
    ];

    if (!isServer) {
      // Prevents webpack from trying to bundle Node core modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
      //Claude Added over Gemini Fix I DONOT EVEN NEED TO SHUT DOWN KYSELY. I WILL IMPORT BETTER-AUTH/MINIMUL
      // config.resolve.alias = {
      //   ...config.resolve.alias,
      //   'node:crypto': false,
      //   'node:stream': false,
      //   'node:buffer': false,
      //   kysely: false,
      //   '@better-auth/kysely-adapter': false,
      // };
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

const plugins = [withNx, withBundleAnalyzer];

module.exports = composePlugins(...plugins)(nextConfig);
