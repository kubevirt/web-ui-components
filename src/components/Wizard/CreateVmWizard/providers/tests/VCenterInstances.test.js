// TODO: implement more tests

import React from 'react';
import { shallow } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import { getVCenterInstancesConnected } from '../VCenterInstances';
import { basicSettings } from '../fixtures/VCenterInstances.fixture';

describe('<VCenterInstancesConnected /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const VCenterInstancesConnected = getVCenterInstancesConnected(basicSettings, WithResources);
    const component = shallow(
      <VCenterInstancesConnected onChange={onChange} id="test-dropdown-id" value="test-instance-1" />
    );
    expect(component).toMatchSnapshot();
  });
});
