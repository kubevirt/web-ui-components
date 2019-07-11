export const CONVERSION_POD_TEMP_MOUNT_PATH = '/var/tmp';
export const CONVERSION_POD_VDDK_MOUNT_PATH = '/data/vddklib'; // will be /data/vddklib/vmware-vix-disklib-distrib

export const CONVERSION_BASE_NAME = 'kubevirt-v2v-conversion';
export const CONVERSION_GENERATE_NAME = `${CONVERSION_BASE_NAME}-`;

export const CONVERSION_PROGRESS_ANNOTATION = 'v2vConversionProgress';

export const V2VVMWARE_DEPLOYMENT_NAME = 'v2v-vmware';

export const VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACE = 'openshift'; // along the common-templates ...
export const VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME = V2VVMWARE_DEPLOYMENT_NAME;

export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE = 'kube-public'; // note: common-templates are in the "openshift" namespace
// TODO: make it configurable via VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP
export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME = 'vmware-to-kubevirt-os'; // single configMap per cluster, contains mapping of vmware guestId to common-templates OS ID
