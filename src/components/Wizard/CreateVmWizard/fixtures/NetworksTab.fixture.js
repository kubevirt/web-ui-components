import { NetworksTab } from '..';
import { networkConfigs } from '../../../../constants';

export default {
  component: NetworksTab,
  props: {
    onChange: () => {},
    networks: [],
    pxeBoot: true,
    networkConfigs,
    namespace: 'default',
  },
};
