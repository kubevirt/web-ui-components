import { V2VVMwareModel } from '../../../models';

export const deleteV2VvmwareObject = async ({ name, namespace }, { k8sKill }) => {
  try {
    return k8sKill(V2VVMwareModel, {
      metadata: {
        name,
        namespace,
      },
    });
  } catch (ignored) {
    // best effort delete - will be deleted by controller eventually
    return null;
  }
};
