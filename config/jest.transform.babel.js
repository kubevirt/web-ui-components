// Custom Jest transformer that wraps babel-jest and applies project-specific
// Babel options, avoiding the need to rely on .babelrc lookup semantics.

module.exports = require('babel-jest').createTransformer(require('./babel.config'));
