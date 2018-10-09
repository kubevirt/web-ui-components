// Common ESLint rule configuration extracted from patternfly-react/recommended.

module.exports = {
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: true
    }
  ],
  'import/no-named-default': 'off',
  'import/prefer-default-export': 'off',
  'no-param-reassign': 'off',
  'no-plusplus': 'off',
  'no-prototype-builtins': 'off',
  'no-restricted-syntax': 'off',
  'no-underscore-dangle': 'off',
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTernary: true
    }
  ],
  'no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'none',
      ignoreRestSiblings: true
    }
  ],
  'no-use-before-define': 'off',
  'no-return-assign': 'off'
};
