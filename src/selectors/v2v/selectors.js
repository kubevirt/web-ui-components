import { get } from 'lodash';

import { getSimpleV2vVMwareStatus } from '../../utils/status/v2vVMware/v2vVMwareStatus';
import { V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL } from '../../utils/status/v2vVMware';

export const getVms = (v2vvmware, defaultValue) => get(v2vvmware, 'spec.vms', defaultValue);
export const getThumbprint = v2vvmware => get(v2vvmware, 'spec.thumbprint');

export const getLoadedVm = (v2vvmware, vmName) =>
  getSimpleV2vVMwareStatus(v2vvmware) === V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL
    ? getVms(v2vvmware, []).find(v => v.name === vmName && v.detail && v.detail.raw)
    : null;

export const getVmwareSecretLabels = secret => get(secret, 'metadata.labels', {});
export const getVmwareConnectionName = value => get(value, 'spec.connection');
