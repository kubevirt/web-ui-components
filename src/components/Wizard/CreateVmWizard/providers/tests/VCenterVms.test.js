// TODO: implement more tests

import React from 'react';
import { shallow } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import { getVCenterVmsConnected } from '../VCenterVms';
import { basicSettings } from '../fixtures/VCenterInstances.fixture';

describe('<VCenterInstancesConnected /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const VCenterVmsConnected = getVCenterVmsConnected(basicSettings, WithResources);
    const component = shallow(<VCenterVmsConnected onChange={onChange} id="test-dropdown-id" value="test-vm1" />);
    expect(component).toMatchSnapshot();
  });
});
