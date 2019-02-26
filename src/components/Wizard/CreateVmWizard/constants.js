// BasicSettingsTab
export const NAME_KEY = 'name';
export const NAMESPACE_KEY = 'namespace';
export const DESCRIPTION_KEY = 'description';
export const PROVISION_SOURCE_TYPE_KEY = 'provisionSourceType';
export const CONTAINER_IMAGE_KEY = 'containerImage';
export const IMAGE_URL_KEY = 'imageURL';
export const PROVIDER_KEY = 'provider';
export const USER_TEMPLATE_KEY = 'userTemplate';
export const OPERATING_SYSTEM_KEY = 'operatingSystem';
export const FLAVOR_KEY = 'flavor';
export const MEMORY_KEY = 'memory';
export const CPU_KEY = 'cpu';
export const WORKLOAD_PROFILE_KEY = 'workloadProfile';
export const START_VM_KEY = 'startVM';
export const CLOUD_INIT_KEY = 'cloudInit';
export const USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY = 'useCloudInitCustomScript';
export const HOST_NAME_KEY = 'hostname';
export const AUTHKEYS_KEY = 'authKeys';
export const CLOUD_INIT_CUSTOM_SCRIPT_KEY = 'cloudInitCustomScript';

export const BASIC_SETTINGS_TAB_KEY = 'basicSettings';
export const NETWORKS_TAB_KEY = 'network';
export const STORAGE_TAB_KEY = 'storage';
export const RESULT_TAB_KEY = 'result';

// NetworksTab
export const NETWORK_TYPE_MULTUS = 'multus';
export const NETWORK_TYPE_POD = 'pod';

// StorageTab
export const STORAGE_TYPE_PVC = 'pvc';
export const STORAGE_TYPE_DATAVOLUME = 'datavolume';
export const STORAGE_TYPE_CONTAINER = 'container';
export const DATA_VOLUME_SOURCE_BLANK = 'datavolume-blank';
export const DATA_VOLUME_SOURCE_URL = 'datavolume-url';
export const DATA_VOLUME_SOURCE_PVC = 'datavolume-pvc';

// Providers
export const PROVIDER_VMWARE = 'VMWare';
export const PROVIDER_VMWARE_VCENTER_KEY = 'vCenterInstance';
export const PROVIDER_VMWARE_VM_KEY = 'vmwareVm';
export const PROVIDER_VMWARE_USER_NAME_KEY = 'vmwareUserName';
export const PROVIDER_VMWARE_USER_PWD_KEY = 'vmwareUserPwd';
export const PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY = 'vmwareUserPwdCheck';
export const PROVIDER_VMWARE_URL_KEY = 'vmwareURL';
export const PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY = 'rememberVmwareCredentials';
export const PROVIDER_VMWARE_PROVIDER_POD_NAME_KEY = 'vmwareProviderPodName'; // name of v2v Provider Pod created by the UI
export const PROVIDER_VMWARE_CONNECTION = 'vmwareConnection'; // name of Secret
export const PROVIDER_STATUS_CONNECTING = 'connecting';
export const PROVIDER_STATUS_SUCCESS = 'success';
export const PROVIDER_STATUS_CONNECTION_FAILED = 'connectionFailed';
export const V2VVMWARE_DEPLOYMENT_NAME = 'v2v-vmware'; // probably no need to make the name generic
