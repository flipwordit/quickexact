/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable quote-props */
const webpack = require('webpack')
const { resolve, join } = require('path')
// const argv = require('minimist')(process.argv.slice(2));
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const ExtensionReloader = require('webpack-extension-reloader')
const TerserPlugin = require('terser-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
let { version } = require('./package.json')

const config = {
  mode: process.env.NODE_ENV,
  context: join(__dirname, 'src'),
  entry: {
    'background/background': './background/background.js',
    'popup/popup': './popup/popup.js',
    'content/content': './content/content.js',
  },
  output: {
    path: join(__dirname, 'dist/'),
    filename: '[name].js',
  },
  stats: {
    entrypoints: false,
    children: false,
    errors: true,
    builtAt: true,
  },
  resolve: {
    extensions: ['.js', '.vue', '.scss'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  devtool: 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/, /https/],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // { loader: 'style-loader'},
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            // options: {
            //   prependData: '@import "@/styles/shared/vendor/assets/stylesheets/eds/core/_variables.scss";',
            // },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/',
        },
      },
    ],
  },
  performance: {
    hints: false,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: {
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.DefinePlugin({
      global: 'window',
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      { from: 'images', to: 'images' },
      { from: 'fonts/**/*', to: 'fonts/[name].[ext]' },
      { from: 'popup/popup.html', to: 'popup/popup.html' },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: (content) => {
          const manifestObj = JSON.parse(content)
          manifestObj.version = version

          if (config.mode === 'development') {
            manifestObj.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'"
            // manifestObj.web_accessible_resources.push('html/*')
          }

          return JSON.stringify(manifestObj, null, 2)
        },
      },
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // ...( new ZipPlugin({
    //   path: path.join(__dirname, 'dist'),
    //   filename: `Q&E_${version}.zip`,
    // })] : []),
  ],
}

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ])
}

// if (config.mode === 'development') {
//   config.plugins = (config.plugins || []).concat([
//     new WebextensionPlugin({
//       vendor: 'chrome',
//     }),
//   ])
// }

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      port: 9595,
      manifest: join(__dirname, 'src', 'manifest.json'),
      // enteries: {
      //   contentScript: 'content/content',
      //   background: 'background',
      //   extensionPage: 'popup/popup',
      // },
    }),
  ])
}

module.exports = config
