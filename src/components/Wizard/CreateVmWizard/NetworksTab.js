import React from 'react';
import PropTypes from 'prop-types';
import { FormFactory } from '../../Form';
import { TableFactory } from '../../Table/TableFactory';
import { ACTIONS_TYPE, DELETE_ACTION } from '../../Table/constants';
import { POD_NETWORK } from '../../../constants';
import {
  SELECT_NETWORK,
  SELECT_PXE_NIC,
  PXE_NIC_NOT_FOUND_ERROR,
  REMOVE_NIC_BUTTON,
  CREATE_NIC_BUTTON,
  PXE_INFO,
  ERROR_NETWORK_NOT_SELECTED,
  ERROR_EMPTY_ENTITY,
  ERROR_EMPTY_NAME,
  ERROR_NETWORK_NOT_FOUND,
  PXE_NIC,
  HEADER_MAC,
  HEADER_NIC_NAME,
  HEADER_NETWORK,
} from './strings';
import { getValidationObject } from '../../../utils/validations';

const validateNetwork = network => {
  const errors = Array(4).fill(null);

  if (!network || network.id == null) {
    errors[0] = ERROR_EMPTY_ENTITY; // row error on index 0
  }

  if (!network.name) {
    errors[1] = ERROR_EMPTY_NAME;
  }

  if (network.id !== 1 && !network.network) {
    errors[3] = ERROR_NETWORK_NOT_SELECTED;
  }

  return errors;
};

export const validateNetworksNamespace = (networkConfigs, namespace, networks) => {
  const availableNetworkConfigs = networkConfigs.filter(nc => nc.metadata.namespace === namespace);
  networks.filter(network => isBootableNetwork(network)).forEach(network => {
    if (!network.errors) {
      network.errors = Array(4).fill(null);
    }
    network.errors[3] = availableNetworkConfigs.some(nc => nc.metadata.name === network.network)
      ? null
      : ERROR_NETWORK_NOT_FOUND;
  });
};

export const hasError = network => (network.errors ? network.errors.some(error => !!error) : false);

export const isBootableNetwork = network => network.network !== POD_NETWORK && network.network !== '';

export class NetworksTab extends React.Component {
  constructor(props) {
    super(props);
    const rows = props.networks.map(({ id, name, mac, network, isBootable, errors }) => ({
      id,
      name,
      mac,
      network,
      errors,
      isBootable,
      renderConfig: 0,
      edit: false,
      editable: true,
    }));

    validateNetworksNamespace(props.networkConfigs, props.namespace, rows);
    this.resolveBootableNetwork(props.pxeBoot, rows);
    this.publishResults(rows);
    this.state = {
      // eslint-disable-next-line
      nextId: rows.length + 1,
      editing: false,
      rows,
    };
  }

  checkPxeBootable = rows => (this.props.pxeBoot ? rows.some(row => row.isBootable) : true);

  publishResults = rows => {
    let valid = this.checkPxeBootable(rows);
    const nics = rows.map(({ id, isBootable, name, mac, network, errors }) => {
      const result = {
        id,
        isBootable,
        name,
        mac,
        network,
        errors,
      };

      if (valid && errors) {
        for (const error of errors) {
          if (error) {
            valid = false;
            break;
          }
        }
      }
      return result;
    });

    const value = {
      networks: nics,
    };
    this.props.onChange(value, valid);
  };

  onRowActivate = rows => {
    this.setState({ rows, editing: true });
  };

  onRowUpdate = (rows, updatedRowId, editing) => {
    const updatedRow = rows.find(r => r.id === updatedRowId);
    if (updatedRow.isBootable && updatedRow.network === POD_NETWORK) {
      updatedRow.isBootable = false;
    }
    updatedRow.errors = validateNetwork(updatedRow);
    this.rowsChanged(rows, editing);
  };

  rowsChanged = (rows, editing) => {
    this.resolveBootableNetwork(this.props.pxeBoot, rows);
    this.publishResults(rows);
    this.setState({ rows, editing });
  };

  resolveBootableNetwork = (pxeBoot, rows) => {
    if (pxeBoot && !rows.some(row => row.isBootable && !hasError(row))) {
      const bootableNetworks = rows.filter(row => isBootableNetwork(row));
      if (bootableNetworks.length > 0) {
        let bootableFound = false;
        bootableNetworks.forEach(network => {
          if (!bootableFound && !hasError(network)) {
            network.isBootable = true;
            bootableFound = true;
          } else {
            network.isBootable = false;
          }
        });
      }
    }
  };

  createNic = () => {
    this.setState(state => ({
      nextId: state.nextId + 1,
      rows: [
        ...state.rows,
        {
          id: state.nextId,
          isBootable: false,
          editable: true,
          edit: true, // trigger immediate edit,
          name: `eth${state.nextId - 1}`,
          mac: '',
          network: '',
          renderConfig: 0,
        },
      ],
    }));
  };

  getColumns = () => [
    {
      header: {
        label: HEADER_NIC_NAME,
        props: {
          style: {
            width: '32%',
          },
        },
      },
      property: 'name',
      renderConfigs: [
        {
          id: 'name-edit',
          type: 'text',
        },
      ],
    },
    {
      header: {
        label: HEADER_MAC,
        props: {
          style: {
            width: '32%',
          },
        },
      },
      property: 'mac',
      renderConfigs: [
        {
          id: 'mac-edit',
          type: 'text',
        },
      ],
    },
    {
      header: {
        label: HEADER_NETWORK,
        props: {
          style: {
            width: '32%',
          },
        },
      },
      property: 'network',
      renderConfigs: [
        {
          id: 'network-edit',
          type: 'dropdown',
          choices: this.props.networkConfigs
            .filter(networkConfig => networkConfig.metadata.namespace === this.props.namespace)
            .map(networkConfig => networkConfig.metadata.name)
            .concat(POD_NETWORK)
            .filter(networkConfig => !this.state.rows.some(r => r.network === networkConfig)),
          initialValue: SELECT_NETWORK,
        },
      ],
    },
    {
      header: {
        props: {
          style: {
            width: '4%',
          },
        },
      },
      renderConfigs: [
        {
          id: 'actions',
          type: ACTIONS_TYPE,
          actions: [
            {
              actionType: DELETE_ACTION,
              text: REMOVE_NIC_BUTTON,
            },
          ],
          visibleOnEdit: false,
        },
      ],
    },
  ];

  getActionButtons = () => [
    {
      className: 'create-network',
      onClick: this.createNic,
      id: 'create-network-btn',
      text: CREATE_NIC_BUTTON,
      disabled: this.state.editing,
    },
  ];

  getFormFields = pxeNetworks => ({
    pxeNetwork: {
      id: 'pxe-nic-dropdown',
      title: PXE_NIC,
      type: 'dropdown',
      defaultValue: SELECT_PXE_NIC,
      choices: pxeNetworks.map(n => n.name),
      required: true,
      help: PXE_INFO,
    },
  });

  onFormChange = newValue => {
    this.setState(state => {
      state.rows.forEach(row => {
        row.isBootable = row.name === newValue;
      });
      this.publishResults(state.rows);
      return state.rows;
    });
  };

  render() {
    const columns = this.getColumns();
    const actionButtons = this.getActionButtons();

    let pxeForm;
    if (this.props.pxeBoot) {
      const pxeNetworks = this.state.rows.filter(row => isBootableNetwork(row) && !hasError(row));
      const bootableNetwork = pxeNetworks.find(row => row.isBootable);
      const values = {
        pxeNetwork: {
          value: bootableNetwork ? bootableNetwork.name : undefined,
          validation: pxeNetworks.length === 0 ? getValidationObject(PXE_NIC_NOT_FOUND_ERROR) : undefined,
        },
      };

      pxeForm = (
        <FormFactory
          fields={this.getFormFields(pxeNetworks)}
          fieldsValues={values}
          onFormChange={this.onFormChange}
          textPosition="text-left"
          labelSize={2}
          controlSize={10}
          formClassName="pxe-form"
        />
      );
    }
    return (
      <React.Fragment>
        <TableFactory
          actionButtons={actionButtons}
          columns={columns}
          rows={this.state.rows}
          onRowUpdate={this.onRowUpdate}
          onRowDeleteOrMove={this.rowsChanged}
          onRowActivate={this.onRowActivate}
        />
        {pxeForm}
      </React.Fragment>
    );
  }
}

NetworksTab.propTypes = {
  onChange: PropTypes.func.isRequired,
  networks: PropTypes.array.isRequired,
  pxeBoot: PropTypes.bool.isRequired,
  networkConfigs: PropTypes.array.isRequired,
  namespace: PropTypes.string.isRequired,
};
