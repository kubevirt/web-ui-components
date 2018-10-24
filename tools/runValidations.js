const chalk = require('chalk');
const requireAll = require('require-all');
const { checkMark } = require('./common');

function loadValidations() {
  return requireAll({
    dirname: `${__dirname}/validations`,
    recursive: false,
    filter: filename => {
      if (filename.endsWith('.js') && !filename.endsWith('.test.js')) {
        return filename.replace(/\.js$/, '');
      }
      return false;
    }
  });
}

function runValidations() {
  const validations = loadValidations();
  let success = true;

  for (const validationName of Object.keys(validations)) {
    console.log(chalk`Validate {yellow.bold ${validationName}}`);
    const result = validations[validationName]();
    result && console.log(chalk`{green ${checkMark}}`);
    success = success && result;
  }

  return success;
}

if (!runValidations()) {
  console.log('One or more validations failed.');
  process.exit(1); // eslint-disable-line
}
