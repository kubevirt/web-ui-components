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
    // generate a static version of the Cosmos application
    await execShell('yarn cosmos:export');
    // add build-info.txt to provide additional build details
    fs.writeFileSync(`${paths.cosmosExport}/build-info.txt`, getBuildInfo());
    // add .nojekyll file to turn off Jekyll when served via GitHub Pages
    fs.writeFileSync(`${paths.cosmosExport}/.nojekyll`, '');
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = exportCosmos;
