// Custom Jest transformer that wraps babel-jest and applies project-specific
// Babel options, avoiding the need to rely on .babelrc lookup semantics.

module.exports = require('babel-jest').createTransformer({
  presets: ['@babel/env', '@babel/react'],
  plugins: ['@babel/plugin-proposal-class-properties'],
});
