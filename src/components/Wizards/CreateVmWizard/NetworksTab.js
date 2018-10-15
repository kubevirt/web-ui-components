import React from 'react';
import PropTypes from 'prop-types';
import { TableFactory } from '../../Table/TableFactory';
import { ACTIONS_TYPE, DELETE_ACTION } from '../../Table/constants';
import { POD_NETWORK } from '../../../constants';

const BOOTABLE = '(Bootable)';

const validateNetwork = network => {
  const errors = Array(3).fill(null);

  if (!network || network.id == null) {
    errors[0] = 'Empty entity.'; // row error on index 0
  }

  if (!network.name) {
    errors[1] = 'Name is empty';
  }

  if (network.id !== 1 && !network.network) {
    errors[3] = 'Network config must be selected';
  }

  return errors;
};

export class NetworksTab extends React.Component {
  constructor(props) {
    super(props);
    let rows = props.networks.map(({ id, isBootable, name, mac, network, errors }) => ({
      id,
      isBootable: isBootable && props.pxeBoot,
      name,
      mac,
      network,
      errors,
      renderConfig: 0,
      edit: false,
      addendum: isBootable && props.pxeBoot ? BOOTABLE : null
    }));

    rows = this.resolveBootability(rows);
    const pxeBootError = this.checkPxeBootNetwork(rows);
    this.publishResults(rows, pxeBootError);

    this.state = {
      // eslint-disable-next-line
      nextId: rows.length + 1,
      editing: false,
      rows,
      pxeBootError
    };
  }

  checkPxeBootNetwork = rows => {
    if (!this.props.pxeBoot) {
      return false;
    }
    const bootableNetwork = rows.find(row => row.network !== POD_NETWORK && row.network !== '');
    return !bootableNetwork;
  };

  resolveBootability = rows => {
    const bootableNetwork = rows.find(row => row.network !== POD_NETWORK && row.network !== '');
    if (this.props.pxeBoot && bootableNetwork && !bootableNetwork.isBootable) {
      // change detected
      let isBootable = true;
      return rows.map(row => {
        if (row.id === 1) {
          return row;
        }
        const result = {
          ...row,
          isBootable,
          addendum: isBootable ? BOOTABLE : null
        };
        if (isBootable) {
          // only the first one is bootable
          isBootable = false;
        }
        return result;
      });
    }
    return rows;
  };

  publishResults = (rows, pxeBootError) => {
    let valid = !pxeBootError;
    const nics = rows.map(({ id, name, mac, network, isBootable, errors }) => {
      const result = {
        id,
        name,
        mac,
        network,
        isBootable,
        errors
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
      networks: nics
    };
    this.props.onChange(value, valid);
  };

  onRowActivate = rows => {
    this.setState({ rows, editing: true });
  };

  onRowUpdate = (rows, updatedRowId, editing) => {
    const updatedRow = rows.find(r => r.id === updatedRowId);
    updatedRow.errors = validateNetwork(updatedRow);
    this.rowsChanged(rows, editing);
  };

  rowsChanged = (rows, editing) => {
    rows = this.resolveBootability(rows);
    const pxeBootError = this.checkPxeBootNetwork(rows);
    this.publishResults(rows, pxeBootError);
    this.setState({ rows, editing, pxeBootError });
  };

  createNic = () => {
    this.setState(state => ({
      nextId: state.nextId + 1,
      rows: [
        ...state.rows,
        {
          id: state.nextId,
          isBootable: false,
          edit: true, // trigger immediate edit,
          name: `eth${state.nextId - 1}`,
          mac: '',
          network: '',
          renderConfig: 0
        }
      ]
    }));
  };

  getColumns = () => [
    {
      header: {
        label: 'NIC Name',
        props: {
          style: {
            width: '32%'
          }
        }
      },
      property: 'name',
      hasAddendum: true,
      renderConfigs: [
        {
          id: 'name-edit',
          type: 'text'
        }
      ]
    },
    {
      header: {
        label: 'MAC Address',
        props: {
          style: {
            width: '32%'
          }
        }
      },
      property: 'mac',
      renderConfigs: [
        {
          id: 'mac-edit',
          type: 'text'
        }
      ]
    },
    {
      header: {
        label: 'Network Configuration',
        props: {
          style: {
            width: '32%'
          }
        }
      },
      property: 'network',
      renderConfigs: [
        {
          id: 'network-edit',
          type: 'dropdown',
          choices: this.props.networkConfigs
            .map(networkConfig => networkConfig.metadata.name)
            .concat(POD_NETWORK)
            .filter(networkConfig => !this.state.rows.some(r => r.network === networkConfig)),
          initialValue: '--- Select Network Definition ---'
        }
      ]
    },
    {
      header: {
        props: {
          style: {
            width: '4%'
          }
        }
      },
      renderConfigs: [
        {
          id: 'actions',
          type: ACTIONS_TYPE,
          actions: [
            {
              actionType: DELETE_ACTION,
              text: 'Remove NIC'
            }
          ],
          visibleOnEdit: false
        }
      ]
    }
  ];

  getActionButtons = () => [
    {
      className: 'create-network',
      onClick: this.createNic,
      id: 'create-network-btn',
      text: 'Create NIC',
      disabled: this.state.editing
    }
  ];

  render() {
    const columns = this.getColumns();
    const actionButtons = this.getActionButtons();

    return (
      <TableFactory
        actionButtons={actionButtons}
        columns={columns}
        rows={this.state.rows}
        onRowUpdate={this.onRowUpdate}
        onRowDeleteOrMove={this.rowsChanged}
        onRowActivate={this.onRowActivate}
        error={this.state.pxeBootError ? 'At least one bootable NIC has to be defined for PXE boot' : ''}
      />
    );
  }
}

NetworksTab.propTypes = {
  onChange: PropTypes.func.isRequired,
  networks: PropTypes.array.isRequired,
  pxeBoot: PropTypes.bool.isRequired,
  networkConfigs: PropTypes.array.isRequired
};
