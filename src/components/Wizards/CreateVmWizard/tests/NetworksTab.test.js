import React from 'react';
import { shallow, mount } from 'enzyme';
import { NetworksTab } from '..';
import NetworksTabFixture from '../fixtures/NetworksTab.fixture';
import { TableFactory } from '../../../Table/TableFactory';
import { POD_NETWORK } from '../../../../constants';

const testNetworksTab = (props = NetworksTabFixture.props, mnt = false) => {
  const networksTab = <NetworksTab {...props} />;
  return mnt ? mount(networksTab) : shallow(networksTab);
};

const defaultNetworks = [
  { id: 1, isBootable: false, name: 'nic1', mac: 'mac1', network: POD_NETWORK, errors: [] },
  { id: 2, isBootable: true, name: 'nic2', mac: 'mac2', network: 'network2', errors: [] },
  { id: 3, isBootable: false, name: 'nic3', mac: 'mac3', network: 'network3', errors: [] }
];

describe('<NetworksTab />', () => {
  it('renders correctly', () => {
    const component = testNetworksTab();
    expect(component).toMatchSnapshot();
  });
  it('passes existing networks to FormFactory', () => {
    const props = { ...NetworksTabFixture.props };
    props.networks = defaultNetworks;
    const component = testNetworksTab(props);

    const passedRows = component.find(TableFactory).props().rows;
    expect(passedRows).toHaveLength(3);
    expect(passedRows[0].addendum).toBeNull();
    expect(passedRows[0].renderConfig).toEqual(1);
    expect(passedRows[1].addendum).toEqual('(Bootable)');
    expect(passedRows[1].isBootable).toBeTruthy();
    expect(passedRows[1].renderConfig).toEqual(0);
    expect(passedRows[2].addendum).toBeNull();
    expect(passedRows[2].isBootable).toBeFalsy();
    expect(passedRows[2].renderConfig).toEqual(0);
  });
  it('checkPxeBootNetwork', () => {
    const props = { ...NetworksTabFixture.props };
    props.networks = defaultNetworks;
    const component = testNetworksTab(props);

    const { rows } = component.state();
    expect(component.instance().checkPxeBootNetwork(rows)).toBeFalsy();

    expect(component.instance().checkPxeBootNetwork(rows.slice(0, 1))).toBeTruthy();

    props.pxeBoot = false;
    component.setProps(props);
    expect(component.instance().checkPxeBootNetwork(rows)).toBeFalsy();
    expect(component.instance().checkPxeBootNetwork(rows.slice(0, 1))).toBeFalsy();
  });
  it('resolveBootability', () => {
    const props = { ...NetworksTabFixture.props };
    props.networks = defaultNetworks;
    const component = testNetworksTab(props);

    const { rows } = component.state();
    // change rows order
    let newRows = component.instance().resolveBootability([rows[0], rows[2], rows[1]]);
    expect(newRows[0].isBootable).toBeFalsy();
    expect(newRows[0].addendum).toBeNull();
    expect(newRows[1].isBootable).toBeTruthy();
    expect(newRows[1].addendum).toEqual('(Bootable)');
    expect(newRows[2].isBootable).toBeFalsy();
    expect(newRows[2].addendum).toBeNull();

    newRows = component.instance().resolveBootability([rows[1], rows[0], rows[2]]);
    expect(newRows[0].isBootable).toBeTruthy();
    expect(newRows[0].addendum).toEqual('(Bootable)');
    expect(newRows[1].isBootable).toBeFalsy();
    expect(newRows[1].addendum).toBeNull();
    expect(newRows[2].isBootable).toBeFalsy();
    expect(newRows[2].addendum).toBeNull();
  });
  it('create new network', () => {
    const props = { ...NetworksTabFixture.props };
    props.networks = defaultNetworks.slice(0, 1);
    const component = testNetworksTab(props, true);
    const { nextId, rows, editing } = component.state();

    expect(editing).toBeFalsy();

    component
      .find('#create-network-btn')
      .at(1)
      .simulate('click');

    expect(component.state().editing).toBeTruthy();
    expect(component.state().nextId).toEqual(nextId + 1);
    expect(component.state().rows).toHaveLength(rows.length + 1);

    const newRow = component.state().rows[rows.length];
    expect(newRow.id).toEqual(nextId);
    expect(newRow.isBootable).toBeFalsy();
    expect(newRow.name).toEqual(`eth${nextId - 1}`);
    expect(newRow.mac).toEqual('');
    expect(newRow.network).toEqual('');
    expect(newRow.renderConfig).toEqual(0);
  });
  it('PXE error is shown', () => {
    const props = { ...NetworksTabFixture.props };
    props.networks = defaultNetworks.slice(0, 1);
    const component = testNetworksTab(props, true);

    expect(component.find('.alert-danger').text()).toEqual('At least one bootable NIC has to be defined for PXE boot');

    props.networks = defaultNetworks;
    component.setProps(props);
    component.unmount().mount();

    expect(component.find('.alert-danger').exists()).toBeFalsy();
  });
});
