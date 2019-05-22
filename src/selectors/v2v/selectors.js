import { get } from '..';

import { getSimpleV2vVMwareStatus } from '../../utils/status/v2vVMware/v2vVMwareStatus';
import { V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL } from '../../utils/status/v2vVMware';

export const getVms = (v2vvmware, defaultValue) => get(v2vvmware, 'spec.vms', defaultValue);
export const getThumbprint = v2vvmware => get(v2vvmware, 'spec.thumbprint');

export const getLoadedVm = (v2vvmware, vmName) =>
  v2vvmware && vmName && getSimpleV2vVMwareStatus(v2vvmware) === V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL
    ? getVms(v2vvmware, []).find(v => get(v, 'name') === vmName && get(v, ['detail', 'raw']))
    : null;
