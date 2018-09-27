const path = require('path');
const projectRoot = path.resolve(`${__dirname}/..`);
const pathTo = relativePath => path.join(projectRoot, relativePath);

module.exports = {
  projectRoot,
  packageJson: pathTo('package.json'),
  nodeModules: pathTo('node_modules'),
  src: pathTo('src'),
  components: pathTo('src/components'),
  sass: pathTo('sass'),
  config: pathTo('config'),
  tools: pathTo('tools'),
  coverage: pathTo('coverage'),
  cosmosExport: pathTo('cosmos')
};
