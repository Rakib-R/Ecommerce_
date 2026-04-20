const { join, resolve } = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './src/main.ts',  // ← relative again
  context: __dirname,       // ← THIS tells webpack to resolve relative to product-service folder
  output: {
    path: join(__dirname, '../../dist/apps/product-service'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@packages/error-handler': resolve(__dirname, '../../packages/error-handler/src/index.ts'),
      '@packages/middleware': resolve(__dirname, '../../packages/middleware/src/index.ts'),
      '@packages/prisma': resolve(__dirname, '../../packages/libs/prisma/src/index.ts'),
      '@packages/redis': resolve(__dirname, '../../packages/libs/redis/src/index.ts'),
      '@packages/libs/imagekit': resolve(__dirname, '../../packages/libs/imagekit/index.ts'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', 
          options:
           { transpileOnly: true,
             compilerOptions: {
            ignoreDeprecations: '6.0'
            } 
            
           }  }
          ],
        exclude: /node_modules/
      }
    ]
  },
  externals: [
    ({ request }, callback) => {
      if (!request) return callback();
      if (request.startsWith('.') || request.startsWith('@packages')) {
        return callback();
      }
      callback(null, 'commonjs ' + request);
    }
  ]
};