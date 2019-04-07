import React from 'react';
import { cloneDeep } from 'lodash';
import { shallow, mount } from 'enzyme';
import { MenuItem } from 'patternfly-react';

import { CreateNicRow } from '..';

import { Dropdown } from '../../Form/Dropdown';
import CreateNicRowFixture from '../fixtures/CreateNicRow.fixture';
import { networkConfigs } from '../../../tests/mocks/networkAttachmentDefinition';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';
import { getName } from '../../../selectors';
import { Loading } from '../../Loading';
import { POD_NETWORK } from '../../../constants';

const testCreateNicRow = (networks, nic = {}) => (
  <CreateNicRow {...CreateNicRowFixture.props} networks={networks} nic={nic} />
);

const getNetworkConfigs = component =>
  component
    .find('#network-type')
    .find(Dropdown)
    .find(MenuItem);

describe('<CreateNicRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateNicRow([]));
    expect(component).toMatchSnapshot();
  });

  it('filters already used network definitions', () => {
    const nic = {
      vm: cloudInitTestVm,
    };

    const component = mount(testCreateNicRow(networkConfigs, nic));
    expect(getNetworkConfigs(component)).toHaveLength(1);
    expect(
      getNetworkConfigs(component)
        .find('a')
        .text()
    ).toEqual(getName(networkConfigs[0]));

    const vmWithoutPodNetwork = cloneDeep(cloudInitTestVm);

    delete vmWithoutPodNetwork.spec.template.spec.domain.devices.interfaces;
    delete vmWithoutPodNetwork.spec.template.spec.networks;
    vmWithoutPodNetwork.spec.template.spec.domain.devices.autoAttachPodInterface = false;

    const nicNoPod = {
      vm: vmWithoutPodNetwork,
    };

    component.setProps({
      nic: nicNoPod,
    });
    expect(getNetworkConfigs(component)).toHaveLength(2);
    expect(
      getNetworkConfigs(component)
        .at(0)
        .find('a')
        .text()
    ).toEqual(getName(networkConfigs[0]));
    expect(
      getNetworkConfigs(component)
        .at(1)
        .find('a')
        .text()
    ).toEqual(POD_NETWORK);

    const vmWithMultusNetwork = cloneDeep(vmWithoutPodNetwork);

    vmWithMultusNetwork.spec.template.spec.domain.devices.interfaces = [
      {
        name: 'fooNetwork',
        bridge: {},
      },
    ];
    vmWithMultusNetwork.spec.template.spec.networks = [
      {
        name: 'fooNetwork',
        multus: {
          networkName: getName(networkConfigs[0]),
        },
      },
    ];

    const nicWithMultus = {
      vm: vmWithMultusNetwork,
    };

    component.setProps({
      nic: nicWithMultus,
    });
    expect(getNetworkConfigs(component)).toHaveLength(1);
    expect(
      getNetworkConfigs(component)
        .find('a')
        .text()
    ).toEqual(POD_NETWORK);
  });

  it('falls back to template namespace when vm is missing namespace', () => {
    const vm = cloneDeep(cloudInitTestVm);
    delete vm.metadata.namespace;

    const component = mount(testCreateNicRow(networkConfigs, { vm, vmTemplate: cloudInitTestVm }));
    expect(getNetworkConfigs(component)).toHaveLength(1);
  });

  it('show all namespaces when vm and template do not have a namespace', () => {
    const vm = cloneDeep(cloudInitTestVm);
    delete vm.metadata.namespace;

    const component = mount(testCreateNicRow(networkConfigs, { vm }));
    expect(getNetworkConfigs(component)).toHaveLength(2);
  });

  it('shows loading while getting network configs', () => {
    const component = mount(testCreateNicRow(undefined));
    expect(component.find(Loading).exists()).toBeTruthy();

    component.setProps({
      networks: [],
    });

    expect(component.find(Loading).exists()).toBeFalsy();
  });

  it('shows loading while patching vm', () => {
    const nic = {
      vm: cloudInitTestVm,
      creating: true,
    };

    const component = mount(testCreateNicRow(networkConfigs, nic));
    expect(component.find(Loading).exists()).toBeTruthy();

    nic.creating = false;
    component.setProps({
      nic,
    });
    expect(component.find(Loading).exists()).toBeFalsy();
  });
});
