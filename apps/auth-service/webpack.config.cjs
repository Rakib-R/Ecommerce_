const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/auth-service"),
  },
  resolve: {
    alias: {
      // This fix tells Webpack that "@/" refers to the repo root
      "@": resolve(__dirname, "../../"), 
      "@packages": resolve(__dirname, "../../packages"),
    },
    extensions: [".ts", ".js"],
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