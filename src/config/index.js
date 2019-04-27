export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE = 'kube-public'; // note: common-templates are in the "openshift" namespace
export const VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME = 'vmware-to-kubevirt-os'; // single configMap per cluster, contains mapping of vmware guestId to common-templates OS ID
export const KUBEVIRT_V2V_CONVERSION_CONTAINER_IMAGE = 'quay.io/nyoxi/kubevirt-v2v-conversion:1.12.1-1-gf665c0a';
export const KUBEVIRT_V2V_VMWARE_CONTAINER_IMAGE = 'quay.io/nyoxi/kubevirt-vmware:1.12.1-1';
