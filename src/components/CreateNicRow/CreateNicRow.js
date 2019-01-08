import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { ListFormFactory } from '../Form/FormFactory';
import { getName, getNetworks, getInterfaces } from '../../utils/selectors';
import { validateDNS1123SubdomainValue } from '../../utils/validations';
import { VALIDATION_ERROR_TYPE, POD_NETWORK } from '../../constants';
import { HEADER_NIC_NAME, HEADER_MAC, SELECT_NETWORK } from '../Wizard/CreateVmWizard/strings';
import { NETWORK_TYPE_POD, NETWORK_TYPE_MULTUS } from '../Wizard/CreateVmWizard/constants';
import { Loading } from '../Loading';
import { CancelAcceptButtons } from '../CancelAcceptButtons';
import { settingsValue } from '../../k8s/selectors';

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
      type: 'dropdown',
      defaultValue: networkChoices.length === 0 ? '--- No Network Definition Available ---' : SELECT_NETWORK,
      value: get(nic, 'network.value'),
      choices: networkChoices,
      disabled: nic.creating || networkChoices.length === 0,
      required: true,
    };
  } else {
    network = {
      id: 'network-type-loading',
      type: 'loading',
      LoadingComponent,
      required: true,
    };
  }

  return {
    name: {
      id: 'nic-name',
      value: settingsValue(nic, 'name'),
      validate: validateDNS1123SubdomainValue,
      required: true,
      title: HEADER_NIC_NAME,
      disabled: nic.creating,
    },
    model: {
      id: 'nic-model',
      type: 'label',
      value: settingsValue(nic, 'bus'),
    },
    network,
    mac: {
      id: 'mac-address',
      value: settingsValue(nic, 'mac'),
      title: HEADER_MAC,
      disabled: nic.creating,
    },
  };
};

const isValid = (columns, nic) =>
  Object.keys(columns).every(
    column =>
      get(nic[column], 'validation.type') !== VALIDATION_ERROR_TYPE &&
      (columns[column].required ? get(nic[column], 'value') : true)
  );

const getActions = (nicColumns, nic, LoadingComponent, onAccept, onCancel) =>
  nic.creating ? (
    <LoadingComponent />
  ) : (
    <CancelAcceptButtons onAccept={onAccept} onCancel={onCancel} disabled={!isValid(nicColumns, nic)} />
  );

export const CreateNicRow = ({ nic, onChange, onAccept, onCancel, networks, LoadingComponent }) => {
  const nicColumns = getNicColumns(nic, networks, LoadingComponent);
  const actions = getActions(nicColumns, nic, LoadingComponent, onAccept, onCancel);
  return (
    <ListFormFactory
      fields={nicColumns}
      fieldsValues={nic}
      actions={actions}
      onFormChange={onChange}
      columnSizes={columnSizes}
    />
  );
};

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
