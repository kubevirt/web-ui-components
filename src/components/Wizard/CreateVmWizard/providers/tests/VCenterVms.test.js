// TODO: implement more tests

import React from 'react';
import { mount } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import VCenterVms from '../VCenterVms';
import { basicSettings } from '../fixtures/VCenterInstances.fixture';

const extraProps = {
  WithResources,
  basicSettings,
};

describe('<VCenterVms /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const component = mount(
      <VCenterVms onChange={onChange} id="test-dropdown-id" value="test-vm1" extraProps={extraProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
