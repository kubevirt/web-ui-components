import React from 'react';
import { mount } from 'enzyme';

import VMWareObjectStatus from '../VMWareObjectStatus';

const testVMWareProviderStatus = () => <VMWareObjectStatus />;

// TODO
describe('<VMWareObjectStatus />', () => {
  it('renders correctly', () => {
    const component = mount(testVMWareProviderStatus());
    expect(component).toMatchSnapshot();
  });
});
