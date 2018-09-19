// https://webpack.js.org/configuration/

const chalk = require('chalk');
const paths = require('./paths');
const babelOptions = require('./babel.config');

const webpackMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log(chalk`Running webpack in {white ${webpackMode}} mode.`);

module.exports = {
  mode: webpackMode,

  module: {
    rules: [
      {
        test: /\.js$/,
        include: paths.src,
        loader: 'babel-loader',
        options: babelOptions
      }
    ]
  }
};
