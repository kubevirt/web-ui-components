import React from 'react';
import { mount } from 'enzyme';

import VMWareProviderStatus from '../VMWareProviderStatus';

const testVMWareProviderStatus = () => <VMWareProviderStatus />;

// TODO
describe('<VMWareProviderStatus />', () => {
  it('renders correctly', () => {
    const component = mount(testVMWareProviderStatus());
    expect(component).toMatchSnapshot();
  });
});
