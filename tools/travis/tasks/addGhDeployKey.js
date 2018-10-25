const execShell = require('../execShell');
const { encryptedKey, encryptedInitVector } = require('../env');

async function addGhDeployKey() {
  try {
    // decrypt GitHub deploy key
    await execShell(
      `openssl aes-256-cbc -K ${encryptedKey} -iv ${encryptedInitVector} -in deploy_key.enc -out deploy_key -d`
    );
    await execShell('chmod 600 deploy_key');
    // add deploy key to ssh-agent
    await execShell('ssh-add deploy_key');
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = addGhDeployKey;
