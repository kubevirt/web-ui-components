const fs = require('fs');
const execShell = require('../execShell');
const paths = require('../../../config/paths');

function getBuildInfo() {
  return (
    `Package version: ${require(paths.packageJson).version}\n` +
    `Travis build URL: ${process.env.TRAVIS_BUILD_WEB_URL}\n` +
    `Built on: ${new Date().toUTCString()}\n`
  );
}

async function exportCosmos() {
  try {
    await execShell('yarn cosmos:export');
    fs.writeFileSync(`${paths.cosmosExport}/build-info.txt`, getBuildInfo());
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = exportCosmos;
