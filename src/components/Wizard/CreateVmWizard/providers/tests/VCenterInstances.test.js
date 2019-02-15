// TODO: implement tests

import React from 'react';
import * as _ from 'lodash';

import { shallow } from 'enzyme/build';

import { getVCenterInstancesConnected } from '../VCenterInstances';

export const inject = (children, props) => {
  const safeProps = _.omit(props, ['children']);
  return React.Children.map(children, c => {
    if (!_.isObject(c)) {
      return c;
    }
    return React.cloneElement(c, safeProps);
  });
};

const basicSettings = {
  name: { value: 'test-vm-name' },
  namespace: { value: 'test-namespace' },
};

// mock implementation
const WithResources = ({ resourceMap, resourceToProps, children }) => {
  const childrenProps = {
    choices: ['test-vm1', 'test-vm2'],
    disabled: false,
  };
  return inject(children, childrenProps);
};

describe('<VCenterInstancesConnected /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const VCenterInstancesConnected = getVCenterInstancesConnected(basicSettings, WithResources);
    const component = shallow(<VCenterInstancesConnected onChange={onChange} id="test-dropdown-id" value="test-vm1" />);
    expect(component).toMatchSnapshot();
  });
});
