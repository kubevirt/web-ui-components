import { NETWORK_TYPE_MULTUS } from '../../components/Wizard/CreateVmWizard/constants';

export const podNic = {
  name: 'podnic',
};

export const multusNic = {
  name: 'multusnic',
  network: 'pxe-net-conf',
  networkType: NETWORK_TYPE_MULTUS,
};
