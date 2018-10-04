// Tests and fixtures are React component's best friends.

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
const { crossMark } = require('../common');
const paths = require('../../config/paths');

function checkComponent(file) {
  const componentDir = path.dirname(file);
  const componentName = path.basename(file).replace(/\.js$/, '');
  const friendExists = pathToFriend => fs.existsSync(`${componentDir}/${pathToFriend}`);

  return {
    file,
    componentName,
    hasTest: friendExists(`tests/${componentName}.test.js`),
    hasFixture: friendExists(`fixtures/${componentName}.fixture.js`)
  };
}

module.exports = () => {
  const files = glob
    .sync(`${paths.components}/**/*.js`)
    .filter(file => /^[A-Z]/.test(path.basename(file)))
    .filter(file => !file.endsWith('.test.js'))
    .filter(file => !file.endsWith('.fixture.js'));

  if (files.length === 0) {
    console.log(chalk`{red ${crossMark}} no components found at [{white ${paths.components}}]`);
    return false;
  }

  const checkResults = files.map(checkComponent);
  const missingTests = checkResults.filter(result => !result.hasTest);
  const missingFixtures = checkResults.filter(result => !result.hasFixture);

  if (missingTests.length > 0) {
    console.log(
      chalk`Following components are missing tests, please add ` +
        chalk`{white.bold tests/<ComponentName>.test.js} to fix this problem.`
    );
    for (const result of missingTests) {
      console.log(chalk`{red ${crossMark} ${result.componentName}} [{white ${result.file}}]`);
    }
  }

  if (missingFixtures.length > 0) {
    console.log(
      chalk`Following components are missing fixtures, please add ` +
        chalk`{white.bold fixtures/<ComponentName>.fixture.js} to fix this problem.`
    );
    for (const result of missingFixtures) {
      console.log(chalk`{red ${crossMark} ${result.componentName}} [{white ${result.file}}]`);
    }
  }

  return missingTests.length + missingFixtures.length === 0;
};
