import { V2VVMwareModel } from '../../../../models';
import { VCENTER_TEMPORARY_LABEL } from '../../../../constants';

export const buildV2VVMwareObject = ({ generateName, namespace, connectionSecretName, isTemporary = false }) => {
  const labels = {};
  if (isTemporary) {
    // if set, the Secret is not listed for selection within the dropdown box and is automatically garbage-collected (by controller)
    labels[VCENTER_TEMPORARY_LABEL] = 'true'; // will be automatically garbage-collected by the controller
  }

  return {
    apiVersion: `${V2VVMwareModel.apiGroup}/${V2VVMwareModel.apiVersion}`,
    kind: V2VVMwareModel.kind,
    metadata: {
      generateName,
      namespace,
      labels,
    },
    spec: {
      connection: connectionSecretName,
    },
  };
};
