import React from 'react';
import { mount } from 'enzyme/build';

import { WithResources, k8sCreate } from '../../../../../tests/k8s';
import VCenterInstances from '../VCenterInstances';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';

import { onVmwareCheckConnection, onVCenterInstanceSelected } from '../vmwareActions';
import {
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
} from '../../constants';

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
  it('onVmwareCheckConnection() works', () => {
    const onChange = jest.fn();
    // eslint-disable-next line promise/always-return
    return onVmwareCheckConnection(basicSettingsImportVmwareNewConnection, onChange, k8sCreate).then(result => {
      expect(onChange.mock.calls).toHaveLength(2);
      expect(onChange.mock.calls[0][0].status).toBe(PROVIDER_STATUS_CONNECTING);
      expect(onChange.mock.calls[1][0].V2VVmwareName).toEqual(expect.stringMatching('check-my.domain.com-username--'));
      return result;
    });
  });
  it('onVCenterInstanceSelected() works', () => {
    const onFormChange = jest.fn();
    return onVCenterInstanceSelected(
      k8sCreate,
      { value: 'connection-secret-name' },
      undefined, // key,
      undefined, // formValid
      basicSettingsImportVmwareNewConnection,
      onFormChange
    ).then(result => {
      expect(onFormChange.mock.calls).toHaveLength(1);
      expect(onFormChange.mock.calls[0][0].value[PROVIDER_VMWARE_CONNECTION].V2VVmwareName).toEqual(
        expect.stringMatching('')
      );
      expect(onFormChange.mock.calls[0][1]).toBe(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY);
      return result;
    });
  });
});
