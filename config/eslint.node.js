'use strict'

// https://eslint.org/docs/user-guide/configuring
// This configuration covers code meant to execute in Node.js environment.

module.exports = {

  extends: [
    'standard',
    'plugin:node/recommended'
  ],

  env: {
    es6: true,
    node: true,
    jest: true
  },

  parserOptions: {
    // Node.js loads scripts as CommonJS modules
    sourceType: 'script'
  },

  rules: {
    'strict': ['error', 'global'],
    'node/no-unpublished-require': 0
  }

}
