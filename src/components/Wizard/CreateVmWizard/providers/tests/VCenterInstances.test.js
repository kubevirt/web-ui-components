// TODO: implement more tests

import React from 'react';
import { shallow } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import VCenterInstances from '../VCenterInstances';
import { basicSettings } from '../fixtures/VCenterInstances.fixture';

const extraProps = {
  WithResources,
  basicSettings,
};

describe('<VCenterInstancesConnected /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const component = shallow(
      <VCenterInstances onChange={onChange} id="test-dropdown-id" value="test-instance-1" extraProps={extraProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
