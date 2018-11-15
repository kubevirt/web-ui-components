import React from 'react';
import { shallow, mount } from 'enzyme';
import { MenuItem, HelpBlock } from 'patternfly-react';
import { NetworksTab, validateNetworksNamespace, hasError, isBootableNetwork } from '../NetworksTab';
import NetworksTabFixture from '../fixtures/NetworksTab.fixture';
import { POD_NETWORK } from '../../../../constants';
import { Dropdown } from '../../../Form';
import { SELECT_NETWORK, SELECT_PXE_NIC, PXE_NIC_NOT_FOUND_ERROR } from '../strings';

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
  renderConfig: 0,
  edit: false,
  editable: true,
};

const podRow = {
  id: 1,
  name: 'pod-network',
  mac: '',
  network: POD_NETWORK,
  renderConfig: 0,
  edit: false,
  editable: true,
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

  it('hasError', () => {
    const networkWithError = {
      network: '',
      errors: errorArray,
    };
    expect(hasError(networkWithError)).toBeTruthy();

    const networkWithoutError = {
      network: '',
      errors: nullArray,
    };

    expect(hasError(networkWithoutError)).toBeFalsy();
    expect(hasError({ network: '' })).toBeFalsy();
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

    getNetworkButton(component).simulate('click');
    const rows = getTableRows(component);
    expect(rows).toHaveLength(1);
    const columns = rows.find('td');

    expect(
      columns
        .at(0)
        .find('input')
        .props().defaultValue
    ).toEqual('eth0');

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

    const dropdownItems = columns
      .at(2)
      .find(Dropdown)
      .find(MenuItem);
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
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][1]).toBeTruthy();
    component.update();

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual('pxe-net');
    expect(component.find(HelpBlock).text()).toEqual('');

    // add Pod network - not PXE bootable
    component.instance().rowsChanged([podRow], false);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[2][1]).toBeFalsy();
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
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange.mock.calls[3][1]).toBeTruthy();
    component.update();

    expect(
      component
        .find('#pxe-nic-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual('pxe-net');
    expect(component.find(HelpBlock).text()).toEqual('');
  });

  it('does not require bootable network for non-PXE image sources', () => {
    const component = mount(<NetworksTab {...NetworksTabFixture.props} pxeBoot={false} />);
    expect(component.find('#pxe-nic-dropdown')).toHaveLength(0);
    expect(component.find(HelpBlock)).toHaveLength(0);
  });
});
