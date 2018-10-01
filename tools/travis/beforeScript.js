// This code is executed as part of the 'before_script' build step.
// Note that returning a non-zero exit code will mark the build as failed.

const chalk = require('chalk');
const { encryptedVariablesDefined, pullRequestBuild } = require('./env');
const addGhDeployKey = require('./tasks/addGhDeployKey');
const { checkMark, crossMark } = require('../common');

(async () => {
  // add GitHub deploy key for builds not triggered by a pull request
  if (encryptedVariablesDefined && !pullRequestBuild) {
    if (await addGhDeployKey()) {
      console.log(chalk`{green ${checkMark}} Successfully added GitHub deploy key.`);
    } else {
      console.log(chalk`{red ${crossMark}} Failed to add GitHub deploy key, exiting.`);
      process.exit(1); // eslint-disable-line
    }
  }
})();
