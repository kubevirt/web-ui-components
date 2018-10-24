const {
  TRAVIS_BRANCH,
  TRAVIS_PULL_REQUEST,
  TRAVIS_REPO_SLUG,
  TRAVIS_SECURE_ENV_VARS,
  ENCRYPTED_VARIABLE_TOKEN,
  COMMIT_AUTHOR_EMAIL,
  COMMIT_AUTHOR_NAME
} = process.env;

module.exports = {
  onMasterBranch: TRAVIS_BRANCH === 'master',
  pullRequestBuild: TRAVIS_PULL_REQUEST !== 'false',
  repoSlug: TRAVIS_REPO_SLUG,
  encryptedVariablesDefined: TRAVIS_SECURE_ENV_VARS === 'true',
  encryptedKey: process.env[`encrypted_${ENCRYPTED_VARIABLE_TOKEN}_key`],
  encryptedInitVector: process.env[`encrypted_${ENCRYPTED_VARIABLE_TOKEN}_iv`],
  commitAuthorEmail: COMMIT_AUTHOR_EMAIL,
  commitAuthorName: COMMIT_AUTHOR_NAME
};
