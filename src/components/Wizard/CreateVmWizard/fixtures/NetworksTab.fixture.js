import { NetworksTab } from '..';
import { PROVISION_SOURCE_PXE } from '../../../../constants';
import { networkConfigs } from '../../../../k8s/mock_network';

export default {
  component: NetworksTab,
  props: {
    onChange: () => {},
    networks: [],
    sourceType: PROVISION_SOURCE_PXE,
    networkConfigs,
    namespace: 'default',
  },
};
