const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,
  entry: './src/renderer/index.tsx',
  target: 'web', // Changed from 'electron-renderer' to 'web' for mobile
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
    publicPath: './'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      // Polyfills for Node.js modules not available in mobile browsers
      "fs": false,
      "path": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "buffer": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              strict: false,
              noImplicitAny: false,
              skipLibCheck: true,
              esModuleInterop: true,
              jsx: 'react'
            }
          }
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      maxSize: 500000
    }
  }
};
