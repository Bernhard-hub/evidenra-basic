const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.5,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
};

module.exports = {
  mode: isProduction ? 'production' : 'development',
  cache: false,
  devtool: false,
  entry: './src/renderer/index.tsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
    clean: true,
    publicPath: isDevelopment ? '/' : './',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: isDevelopment,
            configFile: 'tsconfig.json',
          },
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      publicPath: './',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : false,
    }),
    ...(isProduction ? [new WebpackObfuscator(obfuscatorOptions, [])] : []),
  ],
  optimization: {
    minimize: isProduction,
    splitChunks: false,
  },
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 25 * 1024 * 1024,
    maxAssetSize: 25 * 1024 * 1024,
  },
  devServer: {
    port: 8080,
    hot: true,
    static: { directory: path.join(__dirname, 'public') },
  },
};
