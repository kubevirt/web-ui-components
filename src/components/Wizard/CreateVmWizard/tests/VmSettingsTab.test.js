import React from 'react';
import { shallow } from 'enzyme';

import { VmSettingsTab } from '../VmSettingsTab';
import { wizardProps } from '../fixtures/CreateVmWizard.fixture';

const testVmSettingsTab = () => <VmSettingsTab onFieldChange={jest.fn()} {...wizardProps} />;

describe('<VmSettingsTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testVmSettingsTab());
    expect(component).toMatchSnapshot();
  });
  // TODO: add tests
});
