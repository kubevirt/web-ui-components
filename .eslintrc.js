const path = require('path');

module.exports = {
  root: true,
  extends: ['plugin:patternfly-react/recommended'],
  rules: {
    'import/first': 'off'
  },
  overrides: [
    {
      files: ['**/__mocks__/**', '**/Stories/**', '*.stories.js', '*.test.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ],
};
