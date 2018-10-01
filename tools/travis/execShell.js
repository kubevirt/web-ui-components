const chalk = require('chalk');
const execShPromise = require('exec-sh').promise;
const { crossMark } = require('../common');

async function execShell(command, options) {
  console.log(chalk`{yellow ${command}}`);
  try {
    return await execShPromise(command, options);
  } catch (error) {
    console.log(chalk`{red ${crossMark}} command returned non-zero exit code [{blue ${error.code}}]`);
    throw error;
  }
}

execShell.withDefaultOptions = function execShellCreator(defaultOptions) {
  return async (command, options) => execShell(command, { ...defaultOptions, ...options });
};

module.exports = execShell;
