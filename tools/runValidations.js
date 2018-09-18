'use strict'

const chalk = require('chalk')
const { checkMark } = require('./common')

const validations = require('require-all')({
  dirname: `${__dirname}/validations`,
  recursive: false,
  filter: filename => {
    if (filename.endsWith('.js') && !filename.endsWith('.test.js')) {
      return filename.replace(/\.js$/, '')
    }
    return false
  }
})

async function runValidations () {
  let success = true

  for (const validationName of Object.keys(validations)) {
    console.log(chalk`{yellow.bold ${validationName}}`)
    const result = await validations[validationName]()
    result && console.log(chalk`{green ${checkMark}}`)
    success = success && result
  }

  return success
}

runValidations().then(success => {
  if (!success) {
    console.error('One or more validations failed.')
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
})
