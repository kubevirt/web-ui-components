import React from 'react';
import { render } from 'enzyme/build';

import { WithResources } from '../../../../../tests/k8s';
import VCenterVms from '../VCenterVms';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';

const extraProps = {
  WithResources,
  basicSettings: basicSettingsImportVmwareNewConnection,
};

describe('<VCenterVms /> for list of vCenter secrets', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const onFormChange = jest.fn();
    const component = render(
      <VCenterVms
        onChange={onChange}
        onFormChange={onFormChange}
        id="test-dropdown-id"
        value="test-vm1"
        extraProps={extraProps}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
