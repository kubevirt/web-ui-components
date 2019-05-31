import React from 'react';
import { mount } from 'enzyme';

import { VMWareImportProvider } from '../VMWareImportProvider';
import {
  vmSettingsConnectionSuccessful,
  vmSettingsDontSaveCredentials,
} from '../fixtures/VMWareImportProvider.fixture';

const testVMWareImportProvider = () => <VMWareImportProvider />;

// TODO
describe('<VMWareImportProvider />', () => {
  it('renders correctly', () => {
    const component = mount(testVMWareImportProvider());
    expect(component).toMatchSnapshot();
  });

  it('renders correctly when connection is successful', () => {
    const component = mount(<VMWareImportProvider vmSettings={vmSettingsConnectionSuccessful} />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly when password is not saved', () => {
    const component = mount(<VMWareImportProvider vmSettings={vmSettingsDontSaveCredentials} />);
    expect(component).toMatchSnapshot();
  });
});
