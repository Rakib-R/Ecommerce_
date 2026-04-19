const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/auth-service"),
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
          glob: '**/*.cjs',
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