const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/auth-service"),
  },
  resolve: {
    alias: {
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
      assets: [
        './src/assets',
        {
          glob: '**/*.ejs',
          input: './src/utils/email-templates',
          output: 'utils/email-templates',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};