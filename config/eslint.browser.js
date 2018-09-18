'use strict'

// https://eslint.org/docs/user-guide/configuring
// This configuration covers code meant to execute in browser or browser-like environment.

const chalk = require('chalk')
const paths = require('./paths')
const pkg = require(paths.packageJson)

// resolve React version for use with eslint-plugin-react
const reactVersion = /^\D*(\d+).*$/.exec(pkg.peerDependencies.react)[1]
console.log(chalk`Using React {white ${reactVersion}} linting rules.`)

module.exports = {

  extends: [
    'standard',
    'standard-react',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'plugin:jest/recommended'
  ],

  env: {
    es6: true,
    browser: true,
    jest: true
  },

  parser: 'babel-eslint',

  settings: {
    react: {
      version: reactVersion
    }
  }

}
