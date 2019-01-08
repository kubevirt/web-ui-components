# Setting up development environment

## Prerequisites

Install the latest [Node.js](https://nodejs.org) Long Term Support (LTS) version.
An easy way to do that is through [Node Version Manager](https://github.com/creationix/nvm),
which allows you to install and switch between multiple Node.js versions:

```sh
nvm install 'lts/*'       # install the latest LTS version
nvm alias default 'lts/*' # default version to use for new shells
nvm use default           # switch to the default version
node -v                   # print the current Node.js version
```

Install [Yarn](https://yarnpkg.com) package manager for Node.js (latest stable version).
If you'd like to install Yarn manually, download `yarn-<VERSION>.tar.gz` tarball from their
[releases](https://github.com/yarnpkg/yarn/releases), extract it and add `$YARN_HOME/bin`
directory to your `PATH`.

## Project setup

Install or update project's dependencies with Yarn:

```sh
yarn install
```

### Cosmos

Start [Cosmos](https://github.com/react-cosmos/react-cosmos) server used for testing React
components an in isolated environment which simulates the consuming application:

```sh
yarn cosmos
```

Cosmos will watch the `src` directory for changes and rebuild its playground UI accordingly.

### Jest

Start [Jest](https://jestjs.io) in watch mode for executing tests:

```sh
yarn test:watch
```

Jest will watch all files ending with `.test.js` and rerun the corresponding tests.
