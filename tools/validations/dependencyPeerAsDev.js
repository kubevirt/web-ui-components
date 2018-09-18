'use strict'

// Go through peerDependencies declared in package.json file and check that corresponding
// entries exist in devDependencies. This is to ensure that development environment has all
// the necessary modules installed in the node_modules directory.

const chalk = require('chalk')
const { crossMark } = require('../common')
const paths = require('../../config/paths')

module.exports = async function () {
  const pkg = require(paths.packageJson)
  const peerDeps = pkg.peerDependencies
  const devDeps = pkg.devDependencies
  const badDevDeps = []

  for (const depName of Object.keys(peerDeps)) {
    if (!devDeps[depName] || devDeps[depName] !== peerDeps[depName]) {
      badDevDeps.push(depName)
    }
  }

  if (badDevDeps.length > 0) {
    console.log(
      chalk`Following {white.bold peerDependencies} declared in {blue package.json} ` +
      chalk`have either missing or mismatched entries in {white.bold devDependencies}.`
    )
    for (const depName of badDevDeps) {
      console.log(chalk`{red ${crossMark} ${depName}} [{white ${peerDeps[depName]}}]`)
    }
  }

  return badDevDeps.length === 0
}
