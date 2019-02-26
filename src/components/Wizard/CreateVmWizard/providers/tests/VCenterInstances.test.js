import React from 'react';
import { mount } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import VCenterInstances from '../VCenterInstances';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';

const extraProps = {
  WithResources,
  basicSettings: basicSettingsImportVmwareNewConnection,
};

describe('<VCenterInstancesConnected /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const component = mount(
      <VCenterInstances onChange={onChange} id="test-dropdown-id" value="test-instance-1" extraProps={extraProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
