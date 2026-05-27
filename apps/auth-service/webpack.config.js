const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/auth-service"),
  },

    // ✅ ALSO ADD THIS (cleaner suppression)
  ignoreWarnings: [
    {
      module: /prisma/,
      message: /source map/,
    },
  ],

   resolve: {
    extensions: ['.ts', '.js', '.cjs'], // 👈 Add '.cjs' here!
  },
    module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules/,
          /packages\/libs\/prisma\/src\/lib\/generated/, // 👈 important
        ],
      },
    ],
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