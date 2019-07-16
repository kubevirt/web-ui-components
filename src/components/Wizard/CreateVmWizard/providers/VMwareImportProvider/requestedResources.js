import { getResource } from '../../../../../utils';
import { ConfigMapModel, SecretModel, V2VVMwareModel } from '../../../../../models';
import { VCENTER_TEMPORARY_LABEL, VCENTER_TYPE_LABEL } from '../../../../../constants';
import { getVmwareField } from './selectors';
import { NAMESPACE_KEY } from '../../constants';
import { PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY, PROVIDER_VMWARE_V2V_NAME_KEY } from './constants';
import { getVmSettingValue } from '../../utils/vmSettingsTabUtils';
import {
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
} from '../../../../../k8s/requests';

export const getVmWareProviderRequestedResources = state => {
  const v2vVmwareName = getVmwareField(state, PROVIDER_VMWARE_V2V_NAME_KEY);
  const activeVcenterSecretName = getVmwareField(state, PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY);

  const namespace = getVmSettingValue(state, NAMESPACE_KEY);

  const resources = [
    getResource(SecretModel, {
      namespace,
      prop: 'vCenterSecrets',
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
    getResource(ConfigMapModel, {
      name: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
      namespace: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
      isList: false,
      prop: 'vmwareToKubevirtOsConfigMap',
    }),
  ];

  if (v2vVmwareName) {
    resources.push(
      getResource(V2VVMwareModel, {
        name: v2vVmwareName,
        namespace,
        isList: false,
        prop: 'v2vvmware',
      })
    );
  }

  if (activeVcenterSecretName) {
    resources.push(
      getResource(SecretModel, {
        name: activeVcenterSecretName,
        namespace,
        isList: false,
        prop: 'activeVcenterSecret',
      })
    );
  }

  return resources;
};
