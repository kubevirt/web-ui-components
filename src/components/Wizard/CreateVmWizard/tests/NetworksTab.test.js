import React from 'react';
import { shallow } from 'enzyme';
import { NetworksTab, validateNetworksNamespace, hasError, isBootableNetwork } from '../NetworksTab';
import NetworksTabFixture from '../fixtures/NetworksTab.fixture';
import { POD_NETWORK } from '../../../../constants';

const testNetworksTab = () => <NetworksTab {...NetworksTabFixture.props} />;

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

const nullArray = Array(4).fill(null);
const errorArray = Array(4)
  .fill(null, 0, 3)
  .fill('Network config not found', 3, 4);

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
});
