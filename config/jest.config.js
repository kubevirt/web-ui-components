// https://jestjs.io/docs/en/configuration
// We use a single Jest configuration to cover all types of test environments.

const paths = require('./paths');

const testWatch = process.argv.slice(2).includes('--watch');

const commonProjectConfig = {
  rootDir: paths.projectRoot,

  // by convention, all tests use the '.test.js' suffix
  testMatch: ['**/*.test.js'],
};

module.exports = {
  // each project represents a separate test configuration
  projects: [
    {
      displayName: 'jsdom-env',
      ...commonProjectConfig,
      roots: [paths.src],
      testEnvironment: 'jsdom',
      transform: {
        '\\.js$': `${paths.config}/jest.transform.babel.js`,
      },
      transformIgnorePatterns: ['node_modules/(?!(@novnc|@spice-project))'],
      setupFiles: [`${paths.src}/jest/setupTest.js`],
      snapshotSerializers: ['enzyme-to-json/serializer'],
      moduleNameMapper: {
        '\\.(css|scss)$': `${paths.config}/jest.style.mock.js`,
      },
    },

    {
      displayName: 'node-env',
      ...commonProjectConfig,
      roots: [paths.tools],
      testEnvironment: 'node',
    },
  ],

  // don't collect coverage while in watch mode
  collectCoverage: !testWatch,

  // files for which to collect coverage information
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/index.js',
    '!src/**/*.mock.js',
    '!src/**/fixtures/**/*.js',
    '!src/cosmos/*',
    '!src/jest/*',
    'tools/validations/*.js',
  ],

  // coverage output settings
  coverageDirectory: `${paths.coverage}`,
  coverageReporters: ['lcov'],
};
