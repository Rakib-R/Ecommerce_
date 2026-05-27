const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path'); // Added resolve

module.exports = {
  entry: './src/main.ts', 
  output: {
    path: join(__dirname, '../../dist/apps/api-gateway'),
  },

  // ✅ ALSO ADD THIS (cleaner suppression)
    ignoreWarnings: [
      {
        module: /prisma/,
        message: /source map/,
      },
    ],

  resolve: {
   
    // alias: {
    //   // This maps the "@/" prefix to the root of your project
    //   '@': resolve(__dirname, '../../'),
    //   '@packages': resolve(__dirname, '../../packages'),
    // },

    // extensionAlias: {
    //   '.js': ['.ts', '.js'],
    // },
  
    extensions: ['.ts', '.js'],
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
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};