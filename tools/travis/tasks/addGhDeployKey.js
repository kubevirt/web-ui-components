const execShell = require('../execShell');
const { encryptedKey, encryptedInitVector } = require('../env');

async function addGhDeployKey() {
  try {
    await execShell(
      `openssl aes-256-cbc -K ${encryptedKey} -iv ${encryptedInitVector} -in deploy_key.enc -out deploy_key -d`
    );
    await execShell('chmod 600 deploy_key');
    await execShell('eval `ssh-agent -s` && ssh-add deploy_key');
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = addGhDeployKey;
