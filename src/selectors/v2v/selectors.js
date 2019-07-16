import { get } from 'lodash';

import { getSimpleV2vVMwareStatus } from '../../utils/status/v2vVMware/v2vVMwareStatus';
import { V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL } from '../../utils/status/v2vVMware';
import { VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME } from '../../k8s/requests';

export const getVms = (v2vvmware, defaultValue) => get(v2vvmware, 'spec.vms', defaultValue);
export const getThumbprint = v2vvmware => get(v2vvmware, 'spec.thumbprint');

export const getLoadedVm = (v2vvmware, vmName) =>
  getSimpleV2vVMwareStatus(v2vvmware) === V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL
    ? getVms(v2vvmware, []).find(v => v.name === vmName && v.detail && v.detail.raw)
    : null;

export const getVmwareSecretLabels = secret => get(secret, 'metadata.labels', {});
export const getVmwareConnectionName = value => get(value, 'spec.connection');

// full image name of kubevirt-v2v-conversion
// Presence and proper content of the ConfigMap is hard requirement, so ensure proper info makes it into the logs otherwise.
export const getKubevirtV2vConversionContainerImage = kubevirtVmwareConfigMap =>
  get(
    kubevirtVmwareConfigMap,
    ['data', 'v2v-conversion-image'],
    `v2v-conversion-image is missing in the ${VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME} ConfigMap`
  );

// the kubevirt-vmware provider is responsible for reading VMs list/details from the VMware API
export const getKubevirtV2vVmwareContainerImage = kubevirtVmwareConfigMap =>
  get(
    kubevirtVmwareConfigMap,
    ['data', 'kubevirt-vmware-image'],
    `kubevirt-vmware-image is missing in the ${VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME} ConfigMap`
  );

// optional param in the ConfigMap
export const getV2vImagePullPolicy = kubevirtVmwareConfigMap =>
  get(kubevirtVmwareConfigMap, ['data', 'kubevirt-vmware-image-pull-policy'], 'IfNotPresent');
