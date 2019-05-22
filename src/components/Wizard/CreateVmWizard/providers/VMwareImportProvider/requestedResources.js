import { getResource } from '../../../../../utils';
import { ConfigMapModel, SecretModel, V2VVMwareModel } from '../../../../../models';
import { VCENTER_TEMPORARY_LABEL, VCENTER_TYPE_LABEL } from '../../../../../constants';
import {
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
} from '../../../../../config';

export const getVmWareProviderRequestedResources = ({ namespace, v2vVmwareName }) => {
  const resources = {
    vCenterSecrets: {
      resource: getResource(SecretModel, {
        namespace,
        immutable: true,
        matchExpressions: [
          {
            key: VCENTER_TYPE_LABEL,
            operator: 'Exists',
          },
          {
            key: VCENTER_TEMPORARY_LABEL,
            operator: 'DoesNotExist',
          },
        ],
      }),
    },
    vmwareToKubevirtOsConfigMap: {
      resource: getResource(ConfigMapModel, {
        name: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
        namespace: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
        isList: false,
        immutable: true,
      }),
    },
  };

  if (v2vVmwareName) {
    resources.v2vvmware = {
      resource: getResource(V2VVMwareModel, {
        name: v2vVmwareName,
        namespace,
        isList: false,
        immutable: true,
      }),
    };
  }

  return resources;
};
