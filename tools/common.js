const fs = require('fs');

function fileExists(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

module.exports = {
  checkMark: '✓',
  crossMark: '✕',
  fileExists
};
