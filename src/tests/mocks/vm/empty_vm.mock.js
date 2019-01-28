import { VirtualMachineModel } from '../../../models';

export const emptyVm = {
  apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
  kind: VirtualMachineModel.kind,
  metadata: {
    name: 'empty-vm',
    namespace: 'default',
  },
};
