import React from 'react';
import PropTypes from 'prop-types';
import { DesktopViewer } from '@patternfly/react-console';
import { Alert } from 'patternfly-react';
import { get } from 'lodash';

import { FormFactory } from '../Form';
import { settingsValue } from '../../k8s/selectors';
import { DEFAULT_RDP_PORT } from '../../constants';
import { RdpServiceNotConfigured } from './VmConsoles';
import { SELECT_NETWORK_INTERFACE, NIC, GUEST_AGENT_WARNING, NO_IP_ADDRESS } from './strings';
import { NIC_KEY } from './constants';
import { NETWORK_TYPE_MULTUS, NETWORK_TYPE_POD } from '../Wizard/CreateVmWizard/constants';
import { getNetworks } from '../../k8s/vmBuilder';

const getForm = networks => ({
  [NIC_KEY]: {
    id: 'nic-dropdown',
    title: NIC,
    type: 'dropdown',
    defaultValue: SELECT_NETWORK_INTERFACE,
    choices: networks,
  },
});

const getVmRdpNetworks = (vm, vmi) => {
  const networks = getNetworks(vm).filter(n => n.multus || n.pod);
  return get(vmi, 'status.interfaces', [])
    .filter(i => networks.some(n => n.name === i.name))
    .map(i => {
      let ip = i.ipAddress;
      if (i.ipAddress) {
        const subnetIndex = i.ipAddress.indexOf('/');
        if (subnetIndex > 0) {
          ip = i.ipAddress.slice(0, subnetIndex);
        }
      }
      const network = networks.find(n => n.name === i.name);
      return {
        name: i.name,
        type: get(network, 'multus') ? NETWORK_TYPE_MULTUS : NETWORK_TYPE_POD,
        ip,
      };
    });
};

const getDefaultNetwork = networks => {
  if (networks.length === 1) {
    return networks[0];
  }
  if (networks.length > 1) {
    return (
      networks.find(n => n.type === NETWORK_TYPE_MULTUS && n.ipAddress) ||
      networks.find(n => n.type === NETWORK_TYPE_MULTUS)
    );
  }
  return null;
};

export class DesktopViewerSelector extends React.Component {
  constructor(props) {
    super(props);
    const networks = getVmRdpNetworks(props.vm, props.vmi);
    this.state = {
      [NIC_KEY]: {
        value: getDefaultNetwork(networks),
      },
    };
  }

  onFormChange = (newValue, target) => {
    this.setState({
      [target]: newValue,
    });
  };

  render() {
    const networks = getVmRdpNetworks(this.props.vm, this.props.vmi);
    let content;
    switch (get(settingsValue(this.state, NIC_KEY), 'type')) {
      case NETWORK_TYPE_MULTUS:
        if (!this.props.guestAgent) {
          content = <Alert type="warning">{GUEST_AGENT_WARNING}</Alert>;
        } else if (!settingsValue(this.state, NIC_KEY).ip) {
          content = <Alert type="warning">{`${NO_IP_ADDRESS} ${settingsValue(this.state, NIC_KEY).name}`}</Alert>;
        } else {
          const rdp = {
            address: settingsValue(this.state, NIC_KEY).ip,
            port: DEFAULT_RDP_PORT,
          };
          content = <DesktopViewer rdp={rdp} />;
        }
        break;
      case NETWORK_TYPE_POD:
        content =
          this.props.rdpServiceManual || this.props.vncServiceManual ? (
            <DesktopViewer rdp={this.props.rdpServiceManual} vnc={this.props.vncServiceManual} />
          ) : (
            <RdpServiceNotConfigured vm={this.props.vm} />
          );
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown network interface type ${get(settingsValue(this.state, NIC_KEY), 'type')}`);
    }

    return (
      <div className="kubevirt-desktop-viewer-selector">
        <FormFactory fields={getForm(networks)} fieldsValues={this.state} onFormChange={this.onFormChange} />
        {content}
      </div>
    );
  }
}

DesktopViewerSelector.defaultProps = {
  guestAgent: false,
  rdpServiceManual: null,
  vncServiceManual: null,
};

DesktopViewerSelector.propTypes = {
  vm: PropTypes.object.isRequired,
  vmi: PropTypes.object.isRequired,
  guestAgent: PropTypes.bool,
  rdpServiceManual: PropTypes.object,
  vncServiceManual: PropTypes.object,
};
