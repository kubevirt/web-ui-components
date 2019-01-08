const paths = require('../../config/paths');

const getTestedModule = () => require('./dependencyPeerAsDev');
const consoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {});

beforeEach(() => {
  jest.resetModules();
  consoleLog.mockClear();
});

test('devDependencies match peerDependencies', () => {
  jest.doMock(paths.packageJson, () => ({
    devDependencies: {
      foo: '1.x',
      bar: '1.2.x',
    },
    peerDependencies: {
      foo: '1.x',
      bar: '1.2.x',
    },
  }));

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(true);
  expect(consoleLog).not.toHaveBeenCalled();
});

test('devDependencies use different version than peerDependencies', () => {
  jest.doMock(paths.packageJson, () => ({
    devDependencies: {
      foo: '1.x',
      bar: '1.2.x',
    },
    peerDependencies: {
      foo: '2.x',
      bar: '1.2.x',
    },
  }));

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});

test('devDependencies are missing entries from peerDependencies', () => {
  jest.doMock(paths.packageJson, () => ({
    devDependencies: {
      foo: '1.x',
    },
    peerDependencies: {
      foo: '1.x',
      bar: '1.2.x',
    },
  }));

  const tested = getTestedModule();
  const result = tested();

  expect(result).toBe(false);
  expect(consoleLog).toHaveBeenCalled();
});
