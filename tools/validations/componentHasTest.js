'use strict'

// Check that every React component has a corresponding <ComponentName>.test.js file.
// Use empty <ComponentName>.notest files to suppress this check, which makes the absence
// of unit tests more explicit.

const path = require('path')
const fs = require('fs-extra')
const recursive = require('recursive-readdir')
const chalk = require('chalk')
const { crossMark } = require('../common')
const paths = require('../../config/paths')

function checkComponent (file) {
  const componentDir = path.dirname(file)
  const componentName = path.basename(file).replace(/\.js$/, '')
  const friendExists = suffix => fs.existsSync(`${componentDir}/${componentName}${suffix}`)
  const hasTest = friendExists('.test.js') || friendExists('.notest')
  return { file, componentName, hasTest }
}

module.exports = async function () {
  let files = []
  try {
    files = await recursive(`${paths.components}`, [
      '!*.js',
      '*.+(test|stories).js',
      'index.js'
    ])
  } catch (error) {
    console.error('Error while listing files', error)
    return false
  }

  if (files.length === 0) {
    console.log(chalk`Could not find any components at [{white ${paths.components}}]`)
    return false
  }

  const checkResults = files.map(checkComponent)
  const missingTests = checkResults.filter(result => !result.hasTest)

  if (missingTests.length > 0) {
    console.log(
      chalk`Following components are missing unit tests, please add ` +
      chalk`{white.bold <ComponentName>.test.js} or {white.bold <ComponentName>.notest} ` +
      chalk`files to fix this problem.`
    )
    for (const result of missingTests) {
      console.log(chalk`{red ${crossMark} ${result.componentName}} [{white ${result.file}}]`)
    }
  }

  return missingTests.length === 0
}
