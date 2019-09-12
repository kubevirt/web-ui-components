import React from 'react';
import { cloneDeep } from 'lodash';
import { shallow, mount } from 'enzyme';

import CreateNicRowFixture from '../fixtures/CreateNicRow.fixture';
import { networkConfigs } from '../../../tests/mocks/networkAttachmentDefinition';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';
import { getName } from '../../../selectors';
import { Loading } from '../../Loading';
import { POD_NETWORK } from '../../../constants';

import { openDropdown } from '../../../tests/enzyme';

import { CreateNicRow } from '..';

const testCreateNicRow = (networks, nic = {}) => (
  <CreateNicRow {...CreateNicRowFixture.props} networks={networks} nic={nic} />
);

const getNetworkConfigs = (component, initiallyOpened = false) => {
  if (initiallyOpened) {
    return component.find('#network-type').find('a');
  }
  return openDropdown(component.find('#network-type')).find('a');
};

describe('<CreateNicRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateNicRow([]));
    expect(component).toMatchSnapshot();
  });

  it('filters already used network definitions', () => {
    const nic = {
      vm: cloudInitTestVm,
    };

    const component = mount(testCreateNicRow([networkConfigs[0]], nic));
    let netConfigs = getNetworkConfigs(component);
    expect(netConfigs).toHaveLength(1);
    expect(netConfigs.text()).toEqual(getName(networkConfigs[0]));

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
    netConfigs = getNetworkConfigs(component, true);
    expect(netConfigs).toHaveLength(2);
    expect(
      netConfigs
        .at(0)
        .find('a')
        .text()
    ).toEqual(getName(networkConfigs[0]));
    expect(
      netConfigs
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
    netConfigs = getNetworkConfigs(component, true);
    expect(netConfigs).toHaveLength(1);
    expect(netConfigs.find('a').text()).toEqual(POD_NETWORK);
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
