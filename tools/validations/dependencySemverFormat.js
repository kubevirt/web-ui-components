// Go through all dependencies declared in package.json file and check the expected
// semver range format: 'A.x' or 'A.B.x' or 'A.B.C'.

const chalk = require('chalk');
const { crossMark } = require('../common');
const paths = require('../../config/paths');

module.exports = () => {
  const pkg = require(paths.packageJson);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  const badDeps = [];

  for (const depName of Object.keys(deps)) {
    if (!/^(\d+\.x|\d+\.\d+\.x|\d+\.\d+\.\d+.*)$/.test(deps[depName])) {
      badDeps.push(depName);
    }
  }

  if (badDeps.length > 0) {
    console.log(
      chalk`Following dependencies declared in {blue package.json} don't comply with expected ` +
        chalk`semver range format: {white.bold A.x} or {white.bold A.B.x} or {white.bold A.B.C}.`
    );
    for (const depName of badDeps) {
      console.log(chalk`{red ${crossMark} ${depName}} [{blue ${deps[depName]}}]`);
    }
  }

  return badDeps.length === 0;
};
