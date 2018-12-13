// Validate the expected React component file structure.

const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const _ = require('lodash');
const { crossMark, fileExists, isComponent } = require('../common');
const paths = require('../../config/paths');

const expectations = {
  groupIndex: (groupDir, groupName) => `${groupDir}/${groupName}/index.js`,
  componentTest: (componentDir, componentName) => `${componentDir}/tests/${componentName}.test.js`,
  componentSnapshot: (componentDir, componentName) =>
    `${componentDir}/tests/__snapshots__/${componentName}.test.js.snap`,
  componentFixture: (componentDir, componentName) => `${componentDir}/fixtures/${componentName}.fixture.js`,
};

function reportMissingFile({ name, expectedPath }) {
  const relativePath = path.relative(paths.projectRoot, expectedPath);
  console.log(chalk`{red ${crossMark} ${name}} [{blue ${relativePath}}]`);
}

function checkComponentFile(file) {
  const componentDir = path.dirname(file);
  const componentName = path.basename(file).replace(/\.js$/, '');

  return {
    componentDir,
    componentName,
    hasTest: fileExists(expectations.componentTest(componentDir, componentName)),
    hasSnapshot: fileExists(expectations.componentSnapshot(componentDir, componentName)),
    hasFixture: fileExists(expectations.componentFixture(componentDir, componentName)),
  };
}

function checkComponentGroup(dir) {
  const groupDir = path.dirname(dir);
  const groupName = path.basename(dir);
  const componentFiles = glob
    .sync('**/*.js', { cwd: dir, absolute: true, nodir: true })
    .filter(file => isComponent(file));

  return {
    groupDir,
    groupName,
    hasIndex: fileExists(expectations.groupIndex(groupDir, groupName)),
    componentResults: componentFiles.map(checkComponentFile),
  };
}

module.exports = () => {
  const groupResults = glob.sync(`${paths.components}/*/`, { cwd: paths.projectRoot }).map(checkComponentGroup);
  const flatComponentResults = _.flatten(groupResults.map(result => result.componentResults));

  const missingGroupIndexes = groupResults.filter(result => !result.hasIndex);
  if (missingGroupIndexes.length > 0) {
    console.log('Following component groups are missing index files, please add them to fix this problem.');
    missingGroupIndexes
      .map(({ groupDir, groupName }) => ({
        name: groupName,
        expectedPath: expectations.groupIndex(groupDir, groupName),
      }))
      .forEach(reportMissingFile);
  }

  const missingComponentTests = flatComponentResults.filter(result => !result.hasTest);
  if (missingComponentTests.length > 0) {
    console.log('Following components are missing tests, please add them to fix this problem.');
    missingComponentTests
      .map(({ componentDir, componentName }) => ({
        name: componentName,
        expectedPath: expectations.componentTest(componentDir, componentName),
      }))
      .forEach(reportMissingFile);
  }

  const missingComponentSnapshots = flatComponentResults.filter(result => !result.hasSnapshot);
  if (missingComponentSnapshots.length > 0) {
    console.log('Following components are missing test snapshots, please add them to fix this problem.');
    missingComponentSnapshots
      .map(({ componentDir, componentName }) => ({
        name: componentName,
        expectedPath: expectations.componentSnapshot(componentDir, componentName),
      }))
      .forEach(reportMissingFile);
  }

  const missingComponentFixtures = flatComponentResults.filter(result => !result.hasFixture);
  if (missingComponentFixtures.length > 0) {
    console.log('Following components are missing Cosmos fixtures, please add them to fix this problem.');
    missingComponentFixtures
      .map(({ componentDir, componentName }) => ({
        name: componentName,
        expectedPath: expectations.componentFixture(componentDir, componentName),
      }))
      .forEach(reportMissingFile);
  }

  const errorCount = [
    missingGroupIndexes,
    missingComponentTests,
    missingComponentSnapshots,
    missingComponentFixtures,
  ].reduce((acc, badResults) => acc + badResults.length, 0);

  return errorCount === 0;
};
