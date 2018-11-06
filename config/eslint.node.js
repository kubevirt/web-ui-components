// https://eslint.org/docs/user-guide/configuring
// This configuration covers code meant to execute in Node.js environment.

const commonRules = require('./eslint.rules.common');

module.exports = {
  extends: [
    'standard',
    'airbnb',
    'plugin:node/recommended',
    'plugin:jest/recommended',
    // Prettier configuration comes last
    'plugin:prettier/recommended',
    'prettier/standard',
  ],

  env: {
    es6: true,
    node: true,
    jest: true,
  },

  parserOptions: {
    // Node.js loads scripts as CommonJS modules
    sourceType: 'script',
  },

  rules: {
    ...commonRules,
    'no-console': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/newline-after-import': 'off',
  },
};
