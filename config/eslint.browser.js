// https://eslint.org/docs/user-guide/configuring
// This configuration covers code meant to execute in browser or browser-like environment.

const chalk = require('chalk');
const paths = require('./paths');
const pkg = require(paths.packageJson);

// resolve React version for use with eslint-plugin-react
const reactVersion = /^\D*(\d+).*$/.exec(pkg.peerDependencies.react)[1];
console.log(chalk`Using React {white ${reactVersion}} linting rules.`);

const commonRules = require('./eslint.rules.common');
const reactRules = require('./eslint.rules.react');

module.exports = {
  extends: [
    'standard',
    'standard-react',
    'airbnb',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'plugin:jest/recommended',
    // Prettier configuration comes last
    'plugin:prettier/recommended',
    'prettier/react',
    'prettier/standard'
  ],

  env: {
    es6: true,
    browser: true,
    jest: true
  },

  // use babel-eslint parser to ensure parity with Babel-supported syntax
  parser: 'babel-eslint',

  settings: {
    react: {
      version: reactVersion
    }
  },

  rules: {
    ...commonRules,
    ...reactRules,
    'react/destructuring-assignment': [
      'error',
      {
        ignoreClassFields: true
      }
    ]
  }
};
