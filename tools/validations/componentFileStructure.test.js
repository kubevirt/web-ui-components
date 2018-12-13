const _ = require('lodash');
const paths = require('../../config/paths');

const getTestedModule = () => require('./componentFileStructure');
const consoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {});

const fakeGroupDir = '/components/Form';
const fakeJsFiles = [
  `${fakeGroupDir}/index.js`,
  `${fakeGroupDir}/Checkbox.js`,
  `${fakeGroupDir}/Dropdown.js`,
  `${fakeGroupDir}/tests/Checkbox.test.js`,
  `${fakeGroupDir}/tests/Dropdown.test.js`,
  `${fakeGroupDir}/fixtures/Checkbox.fixture.js`,
  `${fakeGroupDir}/fixtures/Dropdown.fixture.js`,
];
const fakeSnapshotFiles = [
  `${fakeGroupDir}/tests/__snapshots__/Checkbox.test.js.snap`,
  `${fakeGroupDir}/tests/__snapshots__/Dropdown.test.js.snap`,
];

const expectations = {
  groupGlobPattern: `${paths.components}/*/`,
  groupGlobOptions: { cwd: paths.projectRoot },
  componentGlobPattern: '**/*.js',
  componentGlobOptions: dir => ({ cwd: dir }),
};

function mockDependencies({ groupDir = fakeGroupDir, jsFiles = fakeJsFiles, snapshotFiles = fakeSnapshotFiles }) {
  jest.doMock('glob', () => ({
    sync: jest.fn((pattern, options) => {
      if (pattern === expectations.groupGlobPattern) {
        if (_.isMatch(options, expectations.groupGlobOptions)) {
          return [groupDir];
        }
      }
      if (pattern === expectations.componentGlobPattern) {
        if (_.isMatch(options, expectations.componentGlobOptions(groupDir))) {
          return jsFiles;
        }
      }
      return [];
    }),
  }));

  jest.doMock('../common', () =>
    Object.assign(jest.requireActual('../common'), {
      fileExists: filePath => [...jsFiles, ...snapshotFiles].includes(filePath),
    })
  );
}

beforeEach(() => {
  jest.resetModules();
  consoleLog.mockClear();
});

test('expected component file structure', () => {
  mockDependencies({});

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(true);
  expect(consoleLog).not.toHaveBeenCalled();
});

test('component group is missing index file', () => {
  mockDependencies({
    jsFiles: fakeJsFiles.filter(file => !file.endsWith('index.js')),
  });

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});

test('component is missing test', () => {
  mockDependencies({
    jsFiles: fakeJsFiles.filter(file => !file.endsWith('Checkbox.test.js')),
  });

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});

test('component is missing test snapshot', () => {
  mockDependencies({
    snapshotFiles: fakeSnapshotFiles.filter(file => !file.endsWith('Checkbox.test.js.snap')),
  });

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});

test('component is missing Cosmos fixture', () => {
  mockDependencies({
    jsFiles: fakeJsFiles.filter(file => !file.endsWith('Checkbox.fixture.js')),
  });

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});
