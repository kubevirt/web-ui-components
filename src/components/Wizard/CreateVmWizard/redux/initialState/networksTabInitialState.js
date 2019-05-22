import { POD_NETWORK } from '../../../../../constants';
import { NETWORK_BINDING_MASQUERADE, NETWORK_TYPE_POD } from '../../constants';

export const podNetwork = {
  rootNetwork: {},
  id: 0,
  name: 'nic0',
  mac: '',
  network: POD_NETWORK,
  editable: true,
  edit: false,
  networkType: NETWORK_TYPE_POD,
  binding: NETWORK_BINDING_MASQUERADE,
};

export const getNetworksInitialState = props => ({
  value: [podNetwork],
  valid: true,
});
