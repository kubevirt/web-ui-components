const execShell = require('../execShell');
const { commitAuthorEmail, commitAuthorName, repoSlug } = require('../env');
const paths = require('../../../config/paths');

async function deployCosmosToGhPages() {
  const cosmosExecShell = execShell.withDefaultOptions({ cwd: paths.cosmosExport });

  try {
    await cosmosExecShell('git init');
    await cosmosExecShell('git add .');
    await cosmosExecShell(`git config user.email ${commitAuthorEmail}`);
    await cosmosExecShell(`git config user.name ${commitAuthorName}`);
    await cosmosExecShell('git commit -m "Deploy Cosmos application to GitHub Pages"');
    await cosmosExecShell('ssh-add -l -E md5'); // TODO(vs) remove this once git push works
    await cosmosExecShell(`git push -f git@github.com:${repoSlug}.git master:gh-pages`);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = deployCosmosToGhPages;
