'use strict'

// https://webpack.js.org/configuration/
// We use a single webpack configuration to cover all types of build.
// Currently, two build types are supported: development and production.

const webpack = require('webpack')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const env = require('./env')
const paths = require('./paths')

// https://github.com/browserslist/browserslist#queries
// Our browser support generally follows openshift/console requirements.
const targetBrowsers = [
  // include browsers with at least 1% global coverage
  '> 1%',
  // exclude all Internet Explorer versions
  'not ie > 0',
  // include last version of browsers we are committed to support
  'last 1 Chrome version',
  'last 1 Firefox version',
  'last 1 Edge version',
  'last 1 Safari version'
]

// check the environment
if (!env.isDev && !env.isProd) {
  throw new Error('Unsupported target environment: NODE_ENV must be set ' +
    'to "development" or "production" (when unset, defaults to "development").')
}

// common modules required by all entry points
const commonModules = ['babel-polyfill']

module.exports = {

  // apply common built-in optimizations
  mode: (env.isProd && 'production') || 'development',

  // application entry points
  entry: {
    'app': [...commonModules, `${paths.src}/index.js`],
  },

  // bundle output configuration
  output: {
    path: paths.dist,
    filename: env.isProd ? 'js/[name].[chunkhash:8].js' : 'js/[name].js',
    chunkFilename: env.isProd ? 'js/[name].[chunkhash:8].chunk.js' : 'js/[name].chunk.js',
  },

  // configure loaders for various application modules
  module: {
    rules: [

      {
        test: /\.js$/,
        include: paths.src,
        loader: 'babel-loader',
        options: {
          presets: [
            ['babel-preset-env', {
              targets: { browsers: targetBrowsers },
              debug: env.isDev
            }],
            'babel-preset-react'
          ],
          plugins: ['transform-object-rest-spread'],
          compact: env.isProd ? true : 'auto'
        }
      },

      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },

      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader',
        options: {
          // use base64-encoded data URLs for images smaller than 8k
          limit: 8192,
          name: env.isProd ? 'media/[name].[contenthash:8].[ext]' : 'media/[name].[ext]'
        }
      }

    ]
  },

  // webpack module resolution options
  resolve: {
    alias: {
      // safety measure: prevent loading multiple React versions
      'react': `${paths.nodeModules}/react`
    }
  },

  // use plugins to customize the build process
  plugins: [

    // define custom global constants with values resolved at compile time,
    // note that the 'mode' option causes process.env.NODE_ENV on DefinePlugin
    // to be set to the corresponding value
    new webpack.DefinePlugin({
      '__DEV__': JSON.stringify(env.isDev)
    }),

    // clean up existing build artifacts
    new CleanWebpackPlugin([ paths.dist ], {
      root: paths.appRoot
    }),

    // generate HTML page for the application bundle
    new HtmlWebpackPlugin({
      template: `${paths.src}/index.html`,
      filename: 'index.html',
      chunks: ['app']
    })

  ],

  // source map generation strategy
  devtool: env.isDev ? 'cheap-eval-source-map' : 'source-map',

  // webpack-dev-server options
  devServer: env.isDev ? {
    host: 'localhost',
    port: 9000,
    contentBase: false,
    index: 'index.html',
    overlay: true
  } : undefined,

  // whether to fail on the first error instead of tolerating it
  bail: env.isProd

}
