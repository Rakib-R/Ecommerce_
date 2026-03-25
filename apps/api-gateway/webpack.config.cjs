const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path'); // Added resolve

module.exports = {
  entry: './src/main.ts', 
  output: {
    path: join(__dirname, '../../dist/apps/api-gateway'),
  },
  resolve: {
    alias: {
      // This maps the "@/" prefix to the root of your project
      '@': resolve(__dirname, '../../'),
      '@packages': resolve(__dirname, '../../packages'),
    },

    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};