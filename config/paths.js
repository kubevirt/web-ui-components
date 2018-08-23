'use strict'

const path = require('path')
const fs = require('fs')

const appRoot = fs.realpathSync(path.join(__dirname, '..'))
const pathTo = relativePath => path.join(appRoot, relativePath)

module.exports = {
  appRoot,
  nodeModules: pathTo('node_modules'),
  src: pathTo('src'),
  config: pathTo('config'),
  dist: pathTo('dist')
}
