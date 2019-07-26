export * from './storage';

export const ANNOTATION_DEFAULT_DISK = 'defaults.template.kubevirt.io/disk';
export const ANNOTATION_DEFAULT_NETWORK = 'defaults.template.kubevirt.io/network';
export const ANNOTATION_FIRST_BOOT = 'kubevirt.ui/firstBoot';
export const ANNOTATION_PXE_INTERFACE = 'kubevirt.ui/pxeInterface';

export const ANNOTATION_CLONE_REQUEST = 'k8s.io/CloneRequest';
export const LABEL_CLONE_APP = 'Host-Assisted-Cloning';

export const LABEL_USED_TEMPLATE_NAME = 'vm.kubevirt.io/template';
export const LABEL_USED_TEMPLATE_NAMESPACE = 'vm.kubevirt.io/template-namespace';

export const CLOUDINIT_DISK = 'cloudinitdisk';
export const CLOUDINIT_NOCLOUD = 'cloudInitNoCloud';
export const CUSTOM_FLAVOR = 'Custom';
export const FLAVOR_LABEL = 'kubevirt.io/flavor';
export const KUBEVIRT_API_VERSION = 'kubevirt.io/v1alpha3';
export const OS_LABEL = 'kubevirt.io/os';
export const POD_NETWORK = 'Pod Networking';

export const DEVICE_TYPE_INTERFACE = 'interface';
export const DEVICE_TYPE_DISK = 'disk';
export const INTERFACE_PATH_KEY = 'interfaces';
export const DISK_PATH_KEY = 'disks';

export const deviceTypeToPathKey = {
  [DEVICE_TYPE_INTERFACE]: INTERFACE_PATH_KEY,
  [DEVICE_TYPE_DISK]: DISK_PATH_KEY,
};

export const PROVISION_SOURCE_PXE = 'PXE';
export const PROVISION_SOURCE_CONTAINER = 'Container';
export const PROVISION_SOURCE_URL = 'URL';
export const PROVISION_SOURCE_IMPORT = 'Import';
export const PROVISION_SOURCE_CLONED_DISK = 'Cloned Disk'; // PVC or upload image to PVC
export const PROVISION_SOURCE_UNKNOWN_DATAVOLUME = 'Unknown DataVolume';
export const PROVISION_SOURCE_UNKNOWN_DATAVOLUME_SOURCE = 'Unknown DataVolume Source';

export const PVC_ACCESSMODE_RWO = 'ReadWriteOnce';
export const PVC_ACCESSMODE_RWM = 'ReadWriteMany';

export const TEMPLATE_API_VERSION = 'template.openshift.io/v1';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.kubevirt.io';
export const TEMPLATE_OS_LABEL = 'os.template.kubevirt.io';
export const TEMPLATE_PARAM_VM_NAME = 'NAME';
export const TEMPLATE_PARAM_VM_NAME_DESC = 'Name for the new VM';
export const TEMPLATE_TYPE_LABEL = 'template.kubevirt.io/type';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io';
export const TEMPLATE_VM_NAME_LABEL = 'vm.kubevirt.io/name';
export const TEMPLATE_OS_NAME_ANNOTATION = 'name.os.template.kubevirt.io';

export const VIRTIO_BUS = 'virtio';

export const BOOT_ORDER_FIRST = 1;
export const BOOT_ORDER_SECOND = 2;

export const VALIDATION_ERROR_TYPE = 'error';
export const VALIDATION_WARNING_TYPE = 'warning';
export const VALIDATION_INFO_TYPE = 'info';

export const OS_WINDOWS_PREFIX = 'win';

export const DEFAULT_RDP_PORT = 3389;
export const DASHES = '---';

export const CDI_KUBEVIRT_IO = 'cdi.kubevirt.io';
export const STORAGE_IMPORT_PVC_NAME = 'storage.import.importPvcName';

export const VCENTER_TYPE_LABEL = 'kubevirt.io/vcenter';
export const VCENTER_TEMPORARY_LABEL = 'kubevirt.io/temporary';

export const VIRT_LAUNCHER_POD_PREFIX = 'virt-launcher-';

export const METALKUBE_CONTROLLER_PROTOCOLS = ['ipmi', 'idrac'];
