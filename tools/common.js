const fs = require('fs');
const path = require('path');

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function isJs(filePath) {
  return filePath.endsWith('.js');
}

function isTest(filePath) {
  return filePath.endsWith('.test.js');
}

function isFixture(filePath) {
  return filePath.endsWith('.fixture.js');
}

function isComponent(filePath) {
  return /^[A-Z]/.test(path.basename(filePath)) && isJs(filePath) && !isTest(filePath) && !isFixture(filePath);
}

module.exports = {
  checkMark: '✓',
  crossMark: '✕',
  fileExists,
  isJs,
  isTest,
  isFixture,
  isComponent,
};
