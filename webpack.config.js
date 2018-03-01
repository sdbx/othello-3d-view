const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  entry: [
    'babel-polyfill',
    './client-test/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    sourceMapFilename: '[name].map',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'othello-3d-view',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(vert|frag|obj|mtl)?$/,
        use: ['raw-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|tiff)?$/,
        use: ['file-loader'],
      },
    ],
  },
};
