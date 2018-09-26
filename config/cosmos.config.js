// https://github.com/react-cosmos/react-cosmos#config

const paths = require('./paths');

module.exports = {
  rootPath: paths.projectRoot,

  // by convention, all fixtures use the '.fixture.js' suffix
  fileMatch: '**/*.fixture.js',

  // additional modules to load along with every component
  globalImports: [
    '@babel/polyfill',
    'patternfly-react/dist/css/patternfly-react.css',
    'patternfly/dist/css/patternfly.css',
    'patternfly/dist/css/patternfly-additions.css'
  ],

  // path to Cosmos proxies
  proxiesPath: `${paths.src}/cosmos/proxies.js`,

  // webpack server settings
  webpackConfigPath: `${paths.config}/cosmos.webpack.config.js`,
  watchDirs: [paths.src],
  port: 9000,

  // directory where cosmos-export tool generates the static application
  outputPath: paths.cosmosExport
};
