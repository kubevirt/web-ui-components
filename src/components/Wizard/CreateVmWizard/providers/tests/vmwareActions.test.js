import { onVmwareCheckConnection, onVCenterInstanceSelected } from '../vmwareActions';
import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { k8sCreate } from '../../../../../tests/k8s';
import {
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_VMWARE_CONNECTION,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
} from '../../constants';

describe('vmware UI action', () => {
  it('onVmwareCheckConnection() works', async () => {
    const onChange = jest.fn();
    // eslint-disable-next line promise/always-return
    await onVmwareCheckConnection(basicSettingsImportVmwareNewConnection, onChange, k8sCreate);
    expect(onChange.mock.calls).toHaveLength(2);
    expect(onChange.mock.calls[0][0].status).toBe(PROVIDER_STATUS_CONNECTING);
    expect(onChange.mock.calls[1][0].V2VVmwareName).toEqual(expect.stringMatching('check-my.domain.com-username--'));
  });
  it('onVmwareCheckConnection() handles error', async () => {
    const onChange = jest.fn();
    const k8sCreateFailing = () => Promise.reject(new Error('Test-only: A dummy reason for rejecting k8sCreate.'));
    // eslint-disable-next line promise/always-return
    await onVmwareCheckConnection(basicSettingsImportVmwareNewConnection, onChange, k8sCreateFailing);
    expect(onChange.mock.calls).toHaveLength(2);
    expect(onChange.mock.calls[0][0].status).toBe(PROVIDER_STATUS_CONNECTING);
    expect(onChange.mock.calls[1][0].status).toBe(PROVIDER_STATUS_CONNECTION_FAILED);
  });
  it('onVCenterInstanceSelected() works', async () => {
    const onFormChange = jest.fn();
    await onVCenterInstanceSelected(
      k8sCreate,
      { value: 'connection-secret-name' },
      undefined, // key,
      undefined, // formValid
      basicSettingsImportVmwareNewConnection,
      onFormChange
    );
    expect(onFormChange.mock.calls).toHaveLength(1);
    expect(onFormChange.mock.calls[0][0].value[PROVIDER_VMWARE_CONNECTION].V2VVmwareName).toEqual(
      expect.stringMatching('')
    );
    expect(onFormChange.mock.calls[0][1]).toBe(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY);
  });
});
