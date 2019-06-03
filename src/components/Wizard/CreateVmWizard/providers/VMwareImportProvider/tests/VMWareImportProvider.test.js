import React from 'react';
import { mount } from 'enzyme';

import { VMWareImportProvider } from '../VMWareImportProvider';

const testVMWareImportProvider = () => <VMWareImportProvider vmSettings={{}} onChange={() => undefined} />;

// TODO
describe('<VMWareImportProvider />', () => {
  it('renders correctly', () => {
    const component = mount(testVMWareImportProvider());
    expect(component).toMatchSnapshot();
  });
});
