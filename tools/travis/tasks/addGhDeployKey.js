const execShell = require('../execShell');
const { encryptedKey, encryptedInitVector } = require('../env');

async function addGhDeployKey() {
  try {
    // decrypt GitHub deploy key
    await execShell(
      `openssl aes-256-cbc -K ${encryptedKey} -iv ${encryptedInitVector} -in deploy_key.enc -out deploy_key -d`
    );
    await execShell('chmod 600 deploy_key');
    // start ssh-agent in the background
    await execShell('eval `ssh-agent -s`');
    // add deploy key to ssh-agent
    await execShell('ssh-add deploy_key');
    // list fingerprints of all private keys
    await execShell('ssh-add -l -E md5');
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = addGhDeployKey;
