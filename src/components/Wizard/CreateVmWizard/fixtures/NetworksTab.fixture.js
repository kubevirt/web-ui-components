import { NetworksTab } from '../NetworksTab';
import { PROVISION_SOURCE_PXE } from '../../../../constants';
import { networkConfigs } from '../../../../tests/mocks/networkAttachmentDefinition';

export default {
  component: NetworksTab,
  props: {
    onChange: () => {},
    networks: [],
    sourceType: PROVISION_SOURCE_PXE,
    networkConfigs,
    namespace: 'default',
    isCreateRemoveDisabled: false,
  },
};
