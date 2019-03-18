import { NETWORK_TYPE_POD, NETWORK_TYPE_MULTUS } from '../../components/Wizard/CreateVmWizard/constants';
import { POD_NETWORK } from '../../constants';
import { network1 } from '../mocks/networkAttachmentDefinition/network.mock';
import { getName } from '../../selectors';

export const podNetwork = {
  name: 'podNetworkName',
  network: POD_NETWORK,
  networkType: NETWORK_TYPE_POD,
};

export const multusNetwork = {
  name: 'pxeNetworkName',
  network: getName(network1),
  isBootable: true,
  networkType: NETWORK_TYPE_MULTUS,
};
