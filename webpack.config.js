const glob = require('glob');
const path = require('path');
const slash = require('slash');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

require('dotenv').config({
  path: path.resolve(__dirname, `${isProduction ? '.' + process.env.NODE_ENV : ''}.env`)
});

const env = process.env;

const paths = {
  dist: path.resolve(__dirname, env.DIST || 'dist'),
  src: path.resolve(__dirname, env.SRC || 'src'),
};

const getEntries = () => {
  const entries = {};
  const files = glob.sync(env.BUNDLE_FILES === 'true' ? path.join(paths.src, '*') : path.join(paths.src, '**', '*')) || [];
  const regEx = /\.(js(x)?|ts(x)?|s[ac]ss?)$/;
  files.forEach( 
    file => 
      regEx.test(file) && Object.assign(entries, {[path.basename(file).replace(regEx, '')]: file})
  );

  return entries;
};

const webpackConfiguration = {
  context: paths.src,
  entry: getEntries() || [],
  mode: env.NODE_ENV || 'development',
  module: {
    strictExportPresence: true,
    rules: [{
      test: /\.(js(x)?|ts(x)?)$/,
      enforce: 'pre',
      loader: require.resolve('source-map-loader'),
      include: paths.dist,
    }, {
      test: /\.js(x)?$/,
      loader: require.resolve('eslint-loader'),
      enforce: 'pre',
      include: paths.src,
      options: {
        fix: isProduction,
        emitWarning: isDevelopment,
        failOnWarning: isProduction,
        configFile: path.resolve(__dirname, '.eslintrc'),
      }
    }, {
      test: /\.ts(x)?$/,
      loader: require.resolve('tslint-loader'),
      enforce: 'pre',
    }, {
      test: /\.s[ac]ss$/i,
      use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader'
      },
      {
        loader: 'postcss-loader'
      },
      {
        loader: 'sass-loader'
      }]
    }, {
      oneOf: [{
        test: /\.js(x)?$/,
        use: [{
          loader: require.resolve('babel-loader'),
        }]
      }, {
        test: /\.ts(x)?$/,
        use: [{
          loader: require.resolve('ts-loader'),
        }]
      }]
    }],
  },
  output: {
    filename: env.BUNDLE_FILES === 'true' ? '[name].js' : (chunkData) => {
      const file = chunkData.chunk.entryModule.rawRequest;
      const dirname = path.dirname(file).replace(slash(paths.src), '');
      return path.join(dirname && dirname.length > 0 ? dirname + '/' : '', '[name].js');
    },
    path: paths.dist,
  },
  resolve: {
    modules: ['node_modules'],
    extensions: [
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx',
      '.es6',
      '.js',
    ],
    alias: {},
    plugins: [
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new FixStyleOnlyEntriesPlugin(),
  ],
  target: 'web',
};

module.exports = webpackConfiguration;