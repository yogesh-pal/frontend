/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.[chunkhash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|onnx)$/,
        use: {
          loader: 'file-loader'
        }
      }
    ]
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      }
    }
  },
  // devtool: 'cheap-module-source-map',
  plugins: [
    new ESLintPlugin(),
    new Dotenv({
      path: `./.env.${process.env.REACT_APP_ENVIRONMENT}`
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      hash: true,
      manifest: './public/manifest.json'
    }),
  ],
};
