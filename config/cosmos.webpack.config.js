// https://webpack.js.org/configuration/

const chalk = require('chalk');

const paths = require('./paths');
const babelOptions = require('./babel.config');

const webpackMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log(chalk`Running webpack in {blue ${webpackMode}} mode.`);

// https://github.com/sass/node-sass#options
const sassOptions = {
  includePaths: [
    `${paths.nodeModules}/bootstrap-sass/assets/stylesheets`,
    `${paths.nodeModules}/font-awesome-sass/assets/stylesheets`,
    `${paths.nodeModules}/patternfly/dist/sass`,
    `${paths.nodeModules}/patternfly-react/dist/sass`,
  ],
};

const cssOptions = {
  includePaths: [`${paths.nodeModules}/@patternfly/react-core/dist/styles/`],
};

module.exports = {
  mode: webpackMode,
  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        include: paths.src,
        loader: 'babel-loader',
        options: babelOptions,
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: sassOptions,
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: cssOptions,
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|eot|otf|ttf|woff|woff2)$/,
        loader: 'file-loader',
      },
    ],
  },
};
