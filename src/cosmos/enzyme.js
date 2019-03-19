import createContext from 'react-cosmos-test/enzyme';

import paths from '../../config/paths';

export default function createTestContext(args) {
  args.proxies = args.proxies || []; // workaround of react-cosmos-test bug
  return createContext({
    ...args,
    cosmosConfigPath: `${paths.config}/cosmos.config.js`,
  });
}
