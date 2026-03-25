//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
   webpack: (config, { isServer }) => {
    // Disable webpack cache
    // config.cache = false;
    return config;
  },
  
  env: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  },
  
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);


