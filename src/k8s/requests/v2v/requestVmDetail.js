import { get } from 'lodash';

import { V2VVMwareModel } from '../../../models';

const { warn } = console;

export const requestVmDetail = async ({ vmName, v2vwmwareName, namespace }, { k8sGet, k8sPatch }) => {
  vmName = (vmName || '').trim();

  // The V2VVMWare object can be reused from the VCenterVmsConnected component or re-queried here. The later option helps to minimize conflicts.
  const v2vvmware = await k8sGet(V2VVMwareModel, v2vwmwareName, namespace);

  // Strategic merge patches seem not to work, so let's do mapping via positional arrays.
  // Probably not a big deal as the controller is designed to avoid VMs list refresh
  const index = get(v2vvmware, 'spec.vms', []).findIndex(vm => vm.name === vmName);
  if (index >= 0) {
    const patch = [
      {
        op: get(v2vvmware, ['spec', 'vms', `[${index}]`, 'detailRequest']) ? 'replace' : 'add',
        path: `/spec/vms/${index}/detailRequest`,
        value: true,
      },
    ];
    await k8sPatch(V2VVMwareModel, v2vvmware, patch); // the controller will supply details for the selected VM
  } else {
    warn(
      'onVCenterVmSelectedConnected: The retrieved V2VVMware object is missing desired VM: "',
      vmName,
      '", ',
      v2vvmware
    );
  }
};
