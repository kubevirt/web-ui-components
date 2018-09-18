'use strict'

// https://jestjs.io/docs/en/configuration
// We use a single Jest configuration to cover all types of test environments.

const paths = require('./paths')

const testWatch = process.argv.slice(2).includes('--watch')
const jsFiles = /\.js$/
const cssFiles = /\.css$/

const commonProjectConfig = {

  // root directory used to locate tests and modules
  rootDir: paths.projectRoot,

  // by convention, all tests use the '.test.js' suffix
  testMatch: ['**/*.test.js']

}

module.exports = {

  // each project represents a separate test configuration
  projects: [

    {
      displayName: 'jsdom-env',
      ...commonProjectConfig,
      roots: [paths.src],
      testEnvironment: 'jsdom',
      transform: {
        [jsFiles.source]: `${paths.config}/jest.transform.babel.js`,
        [cssFiles.source]: `${paths.config}/jest.transform.emptyObj.js`
      },
      setupFiles: [
        `${paths.src}/setupTest.js`
      ],
      snapshotSerializers: [
        'enzyme-to-json/serializer'
      ]
    },

    {
      displayName: 'node-env',
      ...commonProjectConfig,
      roots: [paths.tools],
      testEnvironment: 'node'
    }

  ],

  // don't collect coverage while in watch mode
  collectCoverage: !testWatch,

  // files for which to collect coverage information
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.stories.js'
  ],

  // coverage output settings
  coverageDirectory: `${paths.coverage}`,
  coverageReporters: ['lcov']

}
