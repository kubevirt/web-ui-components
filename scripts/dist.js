const DIST_DIR = './dist';
const SRC_DIR = './src';
const DIST_COMPONENTS_DIR = `${DIST_DIR}/components`;
const COMPONENTS_DIR = `${SRC_DIR}/components`;

process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const chalk = require('chalk');

// const extraFiles = ['LICENSE', 'README.md', 'package.json'];
const extraFiles = [];

const logFileCopy = (src, dest) => {
  console.log(chalk.white(`Copy '${src}' --> ${dest}`));
};

const copyFile = (src, target) => {
  fs.copySync(src, target, {
    filter: (file, dest) => {
      logFileCopy(file, dest);
      return true;
    }
  });
};

function createDirs() {
  console.log(chalk.yellow(`Creating '${DIST_COMPONENTS_DIR}' directory`));
  fs.ensureDirSync(DIST_COMPONENTS_DIR);
}

function copyComponents() {
  fs.copySync(COMPONENTS_DIR, DIST_COMPONENTS_DIR, {
    filter: (file, dest) => {
      if (file.match(/.*__tests__.*/g) || file.match(/.*\.stories\..*/g)) {
        return false;
      }
      logFileCopy(file, dest);
      return true;
    }
  });
}

function copyExtra() {
  extraFiles.forEach(fileName => {
    copyFile(fileName, `${DIST_DIR}/${fileName}`);
  });
  copyFile(`${SRC_DIR}/index.js`, `${DIST_DIR}/index.js`);
}

function start() {
  createDirs();
  copyComponents();
  copyExtra();
}

start();
