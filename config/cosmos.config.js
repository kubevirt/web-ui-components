// https://github.com/react-cosmos/react-cosmos#config

const paths = require('./paths');

module.exports = {
  rootPath: paths.projectRoot,

  // by convention, all fixtures use the '.fixture.js' suffix
  fileMatch: '**/*.fixture.js',

  // additional modules to load along with every component
  globalImports: ['@babel/polyfill', `${paths.sass}/_dependencies.scss`, `${paths.sass}/_components.scss`],

  // path to Cosmos proxies
  proxiesPath: `${paths.src}/cosmos/proxies.js`,

  // webpack configuration
  webpackConfigPath: `${paths.config}/cosmos.webpack.config.js`,
  publicUrl: './',

  // dev server settings
  watchDirs: [paths.src],
  port: 9000,

  // directory where cosmos-export tool generates the static application
  outputPath: paths.cosmosExport
};
