const paths = require('../../config/paths');
const tested = require('./dependencySemverFormat');

const consoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {});

beforeEach(() => {
  jest.resetModules();
  consoleLog.mockClear();
});

test('allowed semver formats', () => {
  jest.doMock(paths.packageJson, () => ({
    dependencies: {
      foo: '1.x',
    },
    devDependencies: {
      bar: '1.2.x',
    },
    peerDependencies: {
      qux: '1.2.3',
    },
  }));

  const result = tested();
  expect(result).toBe(true);
  expect(consoleLog).not.toHaveBeenCalled();
});

test('disallowed semver formats', () => {
  jest.doMock(paths.packageJson, () => ({
    dependencies: {
      foo: '^1.2.3',
    },
    devDependencies: {
      bar: '~1.2.3',
    },
    peerDependencies: {
      qux: '>=1.2.3',
    },
  }));

  const result = tested();
  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});
