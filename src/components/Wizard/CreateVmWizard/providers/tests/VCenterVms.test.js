import React from 'react';
import { render } from 'enzyme/build';

import { k8sGet, WithResources } from '../../../../../tests/k8s';
import VCenterVms from '../VCenterVms';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { getOperatingSystems } from '../../../../..';
import { baseTemplates } from '../../../../../k8s/objects/template';

const extraProps = {
  WithResources,
  basicSettings: basicSettingsImportVmwareNewConnection,
  k8sGet,
  operatingSystems: getOperatingSystems(basicSettingsImportVmwareNewConnection, baseTemplates),
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
