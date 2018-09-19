const path = require('path');
const projectRoot = path.resolve(`${__dirname}/..`);
const pathTo = relativePath => path.join(projectRoot, relativePath);

module.exports = {
  projectRoot,
  packageJson: pathTo('package.json'),
  src: pathTo('src'),
  components: pathTo('src/components'),
  config: pathTo('config'),
  tools: pathTo('tools'),
  coverage: pathTo('coverage'),
  cosmosExport: pathTo('cosmos')
};
