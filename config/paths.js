'use strict'

const path = require('path')

const projectRoot = path.resolve(`${__dirname}/..`)
const pathTo = relativePath => path.join(projectRoot, relativePath)

module.exports = {
  projectRoot,
  packageJson: pathTo('package.json'),
  // nodeModules: pathTo('node_modules'),
  src: pathTo('src'),
  components: pathTo('src/components'),
  // storybook: pathTo('storybook'),
  // dist: pathTo('dist'),
  config: pathTo('config'),
  tools: pathTo('tools'),
  coverage: pathTo('coverage')
}
