const { join, resolve } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin'); // Add this

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './src/main.ts',
  context: __dirname,
  output: {
    path: join(__dirname, '../../dist/apps/product-service'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
    // REMOVE the manual alias object
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, './tsconfig.app.json'), // Points to your app's TS config
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: [
    ({ request }, callback) => {
      if (!request) return callback();

      //   if (request.startsWith('.') || request.startsWith('@packages')) {
      //     return callback();
      //   }
      if (request === 'jsdom') {
        return callback(null, 'commonjs jsdom');
      }

      if (request === '@prisma/client' || request.startsWith('.prisma')) {
        return callback(null, 'commonjs ' + request);
      }

      return callback(); // bundle everything else
    },
  ],
};
