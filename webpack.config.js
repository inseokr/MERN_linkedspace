const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputDirectory = 'dist';

module.exports = () => {

  const env = dotenv.config().parsed;

    // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {

      prev[`process.env.${next}`] = JSON.stringify(env[next]);

      return prev;

    }, {});
  
  return {
    entry: ['babel-polyfill', './src/client/index.js'],
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js'
    },
    module: {
      rules: [{
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
          test: /\.(png|woff|woff2|eot|ttf|svg|jpg|jpeg)$/,
          loader: 'url-loader?limit=100000'
        },
        {
          test: /\.(mp3)$/,
          loader: 'file-loader'
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    devServer: {
      port: 3000,
      open: true,
      historyApiFallback: true,
      proxy: {
      '/': 'https://localhost:5000'
      }
    },
    plugins: [
      new CleanWebpackPlugin([outputDirectory]),
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico'
      })
    ]
  };

};