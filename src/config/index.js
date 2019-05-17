import { get } from 'lodash';

const getRegistryUrl = () => get(window.SERVER_FLAGS, 'registry', 'quay.io/nyoxi'); // TODO: upstream should be moved under quay.io/kubevirt
const getV2vImageTag = () => get(window.SERVER_FLAGS, 'v2vImageTag', 'latest');
export const getV2vImagePullPolicy = () => get(window.SERVER_FLAGS, 'v2vImagePullPolicy', 'IfNotPresent');

export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE = 'kube-public'; // note: common-templates are in the "openshift" namespace
export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME = 'vmware-to-kubevirt-os'; // single configMap per cluster, contains mapping of vmware guestId to common-templates OS ID

export const getKubevirtV2vConversionContainerImage = () =>
  `${getRegistryUrl()}/kubevirt-v2v-conversion:${getV2vImageTag()}`;
export const getKubevirtV2vVmwareContainerImage = () => `${getRegistryUrl()}/kubevirt-vmware:${getV2vImageTag()}`;
