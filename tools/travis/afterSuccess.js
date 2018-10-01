// This code is executed as part of the 'after_success' build step.
// Note that the exit code of 'after' steps does not affect the build result.

const chalk = require('chalk');
const { onMasterBranch, pullRequestBuild } = require('./env');
const exportCosmos = require('./tasks/exportCosmos');
const deployCosmosToGhPages = require('./tasks/deployCosmosToGhPages');
const { checkMark, crossMark } = require('../common');

(async () => {
  // upon pushing to master branch, deploy Cosmos application to gh-pages branch
  if (onMasterBranch && !pullRequestBuild) {
    if ((await exportCosmos()) && (await deployCosmosToGhPages())) {
      console.log(chalk`{green ${checkMark}} Successfully deployed Cosmos application to GitHub Pages.`);
    } else {
      console.log(chalk`{red ${crossMark}} Failed to deploy Cosmos application to GitHub Pages.`);
    }
  }
})();
