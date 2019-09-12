import React from 'react';
import { cloneDeep } from 'lodash';
import { shallow, mount } from 'enzyme';
import { HelpBlock } from 'patternfly-react';

import { NetworksTab, validateNetworksNamespace, isBootableNetwork, validateNetwork } from '../NetworksTab';
import NetworksTabFixture from '../fixtures/NetworksTab.fixture';
import { Dropdown } from '../../../Form';
import { SELECT_NETWORK, SELECT_PXE_NIC, PXE_NIC_NOT_FOUND_ERROR, MAC_ADDRESS_INVALID_ERROR } from '../strings';
import { pxeTemplate } from '../../../../tests/mocks/user_template';
import { NETWORK_TYPE_POD, NETWORK_TYPE_MULTUS } from '../constants';
import { getTemplateInterfaces } from '../../../../utils/templates';

import {
  POD_NETWORK,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_PXE,
} from '../../../../constants';
import { openDropdown } from '../../../../tests/enzyme';

const testNetworksTab = (onChange = () => {}) => <NetworksTab {...NetworksTabFixture.props} onChange={onChange} />;

const networks = [
  {
    network: '',
  },
  {
    network: POD_NETWORK,
  },
  {
    network: 'pxe-net-conf',
  },
  {
    network: 'pxe-net-conf2',
  },
];

const pxeRow = {
  id: 0,
  name: 'pxe-net',
  mac: '',
  network: NetworksTabFixture.props.networkConfigs[0].metadata.name,
  renderEditConfig: 0,
  edit: false,
  editable: true,
  networkType: NETWORK_TYPE_MULTUS,
};

const podRow = {
  id: 1,
  name: 'pod-network',
  mac: '',
  network: POD_NETWORK,
  renderEditConfig: 0,
  edit: false,
  editable: true,
  networkType: NETWORK_TYPE_POD,
};

const nullArray = Array(4).fill(null);
const errorArray = Array(4)
  .fill(null, 0, 3)
  .fill('Network config not found', 3, 4);

const getNetworksTable = component => component.find('table.pf-table-inline-edit');
const getTableRows = component =>
  getNetworksTable(component)
    .find('tbody')
    .find('tr');
const getNetworkButton = component => component.find('button#create-network-btn');

describe('<NetworksTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testNetworksTab());
    expect(component).toMatchSnapshot();
  });

  it('validateNetworksNamespace', () => {
    validateNetworksNamespace(NetworksTabFixture.props.networkConfigs, 'myproject', networks);
    expect(networks[0].errors).toBeUndefined();
    expect(networks[1].errors).toBeUndefined();
    expect(networks[2].errors).toEqual(errorArray);
    expect(networks[3].errors).toEqual(nullArray);

    validateNetworksNamespace(NetworksTabFixture.props.networkConfigs, 'default', networks);
    expect(networks[0].errors).toBeUndefined();
    expect(networks[1].errors).toBeUndefined();
    expect(networks[2].errors).toEqual(nullArray);
    expect(networks[3].errors).toEqual(errorArray);

    validateNetworksNamespace(NetworksTabFixture.props.networkConfigs, 'other', networks);
    expect(networks[0].errors).toBeUndefined();
    expect(networks[1].errors).toBeUndefined();
    expect(networks[2].errors).toEqual(errorArray);
    expect(networks[3].errors).toEqual(errorArray);
  });

  it('isBootableNetwork', () => {
    expect(isBootableNetwork(networks[0])).toBeFalsy();
    expect(isBootableNetwork(networks[1])).toBeFalsy();
    expect(isBootableNetwork(networks[2])).toBeTruthy();
  });

  it('requires bootable network for PXE image source', () => {
    const onChange = jest.fn();
    const component = mount(testNetworksTab(onChange));
    expect(getTableRows(component)).toHaveLength(0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBeFalsy();
    expect(onChange.mock.calls[0][2]).toBeFalsy();

    getNetworkButton(component).simulate('click');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[1][1]).toBeFalsy();
    expect(onChange.mock.calls[1][2]).toBeTruthy();

    const rows = getTableRows(component);
    expect(rows).toHaveLength(1);
    const columns = rows.find('td');

    expect(
      columns
        .at(0)
        .find('input')
        .props().defaultValue
    ).toEqual('nic0');

    expect(
      columns
        .at(1)
        .find('input')
        .props().defaultValue
    ).toBeUndefined();
    expect(
      columns
        .at(1)
        .find('input')
        .props().value
    ).toBeUndefined();

    const dropdownItems = openDropdown(columns.at(2).find(Dropdown)).find('.pf-c-dropdown__menu-item');
    expect(dropdownItems).toHaveLength(2);
    expect(dropdownItems.at(0).text()).toEqual(NetworksTabFixture.props.networkConfigs[0].metadata.name);
    expect(dropdownItems.at(1).text()).toEqual(POD_NETWORK);

    expect(
      columns
        .at(2)
        .find(Dropdown)
        .props().value
    ).toEqual(SELECT_NETWORK);

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual(SELECT_PXE_NIC);
    expect(component.find(HelpBlock).text()).toEqual(PXE_NIC_NOT_FOUND_ERROR);

    // add PXE-bootable network
    component.instance().rowsChanged([pxeRow], false);
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange.mock.calls[3][1]).toBeTruthy();
    expect(onChange.mock.calls[3][2]).toBeFalsy();
    component.update();

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual('pxe-net');
    expect(component.find(HelpBlock)).toHaveLength(0);

    // add Pod network - not PXE bootable
    component.instance().rowsChanged([podRow], false);
    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange.mock.calls[4][1]).toBeFalsy();
    expect(onChange.mock.calls[4][2]).toBeFalsy();
    component.update();

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual(SELECT_PXE_NIC);
    expect(component.find(HelpBlock).text()).toEqual(PXE_NIC_NOT_FOUND_ERROR);

    // add Pod network and PXE-bootable network
    component.instance().rowsChanged([podRow, pxeRow], false);
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(onChange.mock.calls[5][1]).toBeTruthy();
    expect(onChange.mock.calls[5][2]).toBeFalsy();
    component.update();

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual('pxe-net');
    expect(component.find(HelpBlock)).toHaveLength(0);
  });

  it('does not require bootable network for non-PXE image sources', () => {
    const component = mount(<NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_CONTAINER} />);
    expect(component.find('#pxe-nic-dropdown')).toHaveLength(0);
    expect(component.find(HelpBlock)).toHaveLength(0);

    component.setProps({
      sourceType: PROVISION_SOURCE_URL,
    });

    expect(component.find('#pxe-nic-dropdown')).toHaveLength(0);
    expect(component.find(HelpBlock)).toHaveLength(0);

    component.setProps({
      sourceType: PROVISION_SOURCE_CONTAINER,
    });

    expect(component.find('#pxe-nic-dropdown')).toHaveLength(0);
    expect(component.find(HelpBlock)).toHaveLength(0);
  });

  it('initializes template networks', () => {
    const templateInterfaces = getTemplateInterfaces(pxeTemplate);
    const tNetworks = templateInterfaces.map(i => ({
      templateNetwork: i,
    }));
    const component = shallow(<NetworksTab {...NetworksTabFixture.props} networks={tNetworks} />);

    component.state().rows.forEach((row, index) => {
      expect(row.name).toEqual(templateInterfaces[index].network.name);
      expect(row.id).toEqual(index + 1);
      expect(row.templateNetwork).toEqual(templateInterfaces[index]);
    });

    expect(component.state().rows[0].networkType).toEqual(NETWORK_TYPE_POD);
    expect(component.state().rows[0].network).toEqual(POD_NETWORK);
    expect(component.state().rows[1].networkType).toEqual(NETWORK_TYPE_MULTUS);
    expect(component.state().rows[1].network).toEqual(templateInterfaces[1].network.multus.networkName);
  });

  it('resolves bootable network', () => {
    const templateInterfaces = getTemplateInterfaces(pxeTemplate);
    const tNetworks = templateInterfaces.map(i => ({
      templateNetwork: i,
    }));

    // multus network has bootOrder 1
    let component = shallow(
      <NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_PXE} networks={tNetworks} />
    );

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeTruthy();

    const withoutBootOrder = cloneDeep(tNetworks);
    delete withoutBootOrder[1].templateNetwork.interface.bootOrder;

    // multus network does not have bootOrder
    component = shallow(
      <NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_PXE} networks={withoutBootOrder} />
    );

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeTruthy();

    component = shallow(
      <NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_CONTAINER} networks={tNetworks} />
    );

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeFalsy();

    component = shallow(
      <NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_URL} networks={tNetworks} />
    );

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeFalsy();
  });

  it('onRowUpdate sets boot order and network type', () => {
    const rows = [pxeRow, podRow];
    const component = shallow(
      <NetworksTab {...NetworksTabFixture.props} sourceType={PROVISION_SOURCE_PXE} networks={rows} />
    );

    expect(component.state().rows[0].isBootable).toBeTruthy();
    expect(component.state().rows[0].networkType).toEqual(NETWORK_TYPE_MULTUS);
    expect(component.state().rows[1].isBootable).toBeFalsy();
    expect(component.state().rows[1].networkType).toEqual(NETWORK_TYPE_POD);

    const updatedRows = cloneDeep(rows);
    updatedRows[0].network = POD_NETWORK;

    component.instance().onRowUpdate(updatedRows, 0, true, 'network', POD_NETWORK);

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[0].networkType).toEqual(NETWORK_TYPE_POD);
    expect(component.state().rows[1].isBootable).toBeFalsy();
    expect(component.state().rows[1].networkType).toEqual(NETWORK_TYPE_POD);

    updatedRows[1].network = NetworksTabFixture.props.networkConfigs[0].metadata.name;

    component.instance().onRowUpdate(updatedRows, 1, true, 'network', updatedRows[1].network);

    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[0].networkType).toEqual(NETWORK_TYPE_POD);
    expect(component.state().rows[1].isBootable).toBeTruthy();
    expect(component.state().rows[1].networkType).toEqual(NETWORK_TYPE_MULTUS);
  });

  it('PXE NIC dropdown updates bootable network', () => {
    const networkConfig2 = cloneDeep(NetworksTabFixture.props.networkConfigs[1]);
    networkConfig2.metadata.namespace = NetworksTabFixture.props.networkConfigs[0].metadata.namespace;

    const pxeRow2 = {
      id: 2,
      name: 'pxe-net2',
      mac: '',
      network: networkConfig2.metadata.name,
      renderEditConfig: 0,
      edit: false,
      editable: true,
      networkType: NETWORK_TYPE_MULTUS,
    };

    const rows = [pxeRow, podRow, pxeRow2];

    const component = mount(
      <NetworksTab
        {...NetworksTabFixture.props}
        networkConfigs={[NetworksTabFixture.props.networkConfigs[0], networkConfig2]}
        sourceType={PROVISION_SOURCE_PXE}
        networks={rows}
      />
    );

    const pxeDropdown = component.find('#pxe-nic-dropdown');
    expect(openDropdown(pxeDropdown, '#pxe-nic-dropdown').find('a')).toHaveLength(2);
    expect(component.state().rows[0].isBootable).toBeTruthy();
    expect(component.state().rows[1].isBootable).toBeFalsy();
    expect(component.state().rows[2].isBootable).toBeFalsy();

    // pxeDropdown stays open
    component
      .find('#pxe-nic-dropdown')
      .find('.pf-c-dropdown__menu-item')
      .findWhere(item => item.text() === pxeRow2.name)
      .find('a')
      .simulate('click');
    component.update();
    expect(component.state().rows[0].isBootable).toBeFalsy();
    expect(component.state().rows[1].isBootable).toBeFalsy();
    expect(component.state().rows[2].isBootable).toBeTruthy();
  });
});

describe('validateNetwork()', () => {
  it('returns null for an empty MAC address', () => {
    const errors = validateNetwork(pxeRow);
    expect(errors[2]).toBeNull();
  });

  it('returns null for a valid MAC address', () => {
    const network = cloneDeep(pxeRow);
    network.mac = '0a:1b:2c:3d:4e:5f';
    const errors = validateNetwork(network);
    expect(errors[2]).toBeNull();
  });

  it('returns correct error message for invalid MAC address', () => {
    const network = cloneDeep(pxeRow);
    network.mac = '0a:1b';
    const errors = validateNetwork(network);
    expect(errors[2]).toEqual(MAC_ADDRESS_INVALID_ERROR);
  });
});
