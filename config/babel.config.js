'use strict'

// https://babeljs.io/docs/en/next/options

module.exports = {

  presets: [
    ['@babel/preset-env', {
      targets: {
        // https://github.com/browserslist/browserslist#queries
        browsers: [
          '> 1%',
          'not ie > 0',
          'last 1 Chrome version',
          'last 1 Firefox version',
          'last 1 Edge version',
          'last 1 Safari version'
        ]
      }
    }],
    '@babel/preset-react'
  ],

  plugins: [
    '@babel/plugin-proposal-class-properties'
  ]

}
