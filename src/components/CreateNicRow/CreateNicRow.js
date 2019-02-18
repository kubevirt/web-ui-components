import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { CreateDeviceRow } from '../CreateDeviceRow';
import { getName, getNetworks, getInterfaces } from '../../utils/selectors';
import { validateDNS1123SubdomainValue } from '../../utils/validations';
import { POD_NETWORK } from '../../constants';
import { HEADER_NAME, HEADER_MAC, SELECT_NETWORK } from '../Wizard/CreateVmWizard/strings';
import { NETWORK_TYPE_POD, NETWORK_TYPE_MULTUS, NAME_KEY } from '../Wizard/CreateVmWizard/constants';
import { Loading } from '../Loading';
import { settingsValue } from '../../k8s/selectors';
import { DROPDOWN, CUSTOM, LABEL } from '../Form';

const columnSizes = {
  lg: 3,
  md: 3,
  sm: 3,
  xs: 3,
};

const getUsedNetworks = vm => {
  const interfaces = getInterfaces(vm);
  const networks = getNetworks(vm);
  const usedNetworks = [];
  interfaces.forEach(i => {
    const network = networks.find(n => n.name === i.name);
    if (network) {
      if (network.pod) {
        usedNetworks.push({ networkType: NETWORK_TYPE_POD });
      }
      if (network.multus) {
        usedNetworks.push({ networkType: NETWORK_TYPE_MULTUS, name: network.multus.networkName });
      }
    }
  });
  return usedNetworks;
};

const getNetworkChoices = (vm, networks) => {
  const usedNetworks = getUsedNetworks(vm);
  const networkChoices = networks
    .filter(
      network =>
        network.metadata.namespace === vm.metadata.namespace &&
        !usedNetworks
          .filter(usedNetwork => usedNetwork.networkType === NETWORK_TYPE_MULTUS)
          .find(usedNetwork => usedNetwork.name === getName(network))
    )
    .map(network => ({
      name: getName(network),
      networkType: NETWORK_TYPE_MULTUS,
    }));
  if (!usedNetworks.find(usedNetwork => usedNetwork.networkType === NETWORK_TYPE_POD)) {
    networkChoices.push({
      name: POD_NETWORK,
      networkType: NETWORK_TYPE_POD,
    });
  }
  return networkChoices;
};

const getNicColumns = (nic, networks, LoadingComponent) => {
  let network;
  if (networks) {
    const networkChoices = getNetworkChoices(nic.vm, networks);
    network = {
      id: 'network-type',
      type: DROPDOWN,
      defaultValue: networkChoices.length === 0 ? '--- No Network Definition Available ---' : SELECT_NETWORK,
      choices: networkChoices,
      disabled: nic.creating || networkChoices.length === 0,
      required: true,
    };
  } else {
    network = {
      id: 'network-type-loading',
      type: CUSTOM,
      CustomComponent: LoadingComponent,
      required: true,
    };
  }

  return {
    [NAME_KEY]: {
      id: 'nic-name',
      validate: settings => validateDNS1123SubdomainValue(settingsValue(settings, NAME_KEY)),
      required: true,
      title: HEADER_NAME,
      disabled: nic.creating,
    },
    model: {
      id: 'nic-model',
      type: LABEL,
    },
    network,
    mac: {
      id: 'mac-address',
      title: HEADER_MAC,
      disabled: nic.creating || get(settingsValue(nic, 'network'), 'networkType') === NETWORK_TYPE_POD,
    },
  };
};

const onFormChange = (newValue, key, onChange) => {
  if (key === 'network' && get(newValue, 'value.networkType') === NETWORK_TYPE_POD) {
    // reset mac value
    onChange({ value: '' }, 'mac');
  }
  onChange(newValue, key);
};

export const CreateNicRow = ({ nic, onAccept, onCancel, onChange, networks, LoadingComponent }) => (
  <CreateDeviceRow
    onAccept={onAccept}
    onCancel={onCancel}
    onChange={(newValue, key) => onFormChange(newValue, key, onChange)}
    device={nic}
    LoadingComponent={LoadingComponent}
    columnSizes={columnSizes}
    deviceFields={getNicColumns(nic, networks, LoadingComponent)}
  />
);

CreateNicRow.propTypes = {
  nic: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  networks: PropTypes.array,
  LoadingComponent: PropTypes.func,
};

CreateNicRow.defaultProps = {
  networks: undefined,
  LoadingComponent: Loading,
};
