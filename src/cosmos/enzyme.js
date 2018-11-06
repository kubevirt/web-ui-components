import createContext from 'react-cosmos-test/enzyme';
import paths from '../../config/paths';

export default function createTestContext(args) {
  return createContext({
    ...args,
    cosmosConfigPath: `${paths.config}/cosmos.config.js`,
  });
}
