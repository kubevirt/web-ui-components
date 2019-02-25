export const ANNOTATION_DEFAULT_DISK = 'defaults.template.cnv.io/disk';
export const ANNOTATION_DEFAULT_NETWORK = 'defaults.template.cnv.io/network';
export const ANNOTATION_FIRST_BOOT = 'cnv.ui.firstBoot';
export const ANNOTATION_PXE_INTERFACE = 'cnv.ui.pxeInterface';

export const ANNOTATION_CLONE_REQUEST = 'k8s.io/CloneRequest';
export const LABEL_CLONE_APP = 'Host-Assisted-Cloning';

export const LABEL_USED_TEMPLATE_NAME = 'vm.cnv.io/template';
export const LABEL_USED_TEMPLATE_NAMESPACE = 'vm.cnv.io/template-namespace';

export const CLOUDINIT_DISK = 'cloudinitdisk';
export const CLOUDINIT_NOCLOUD = 'cloudInitNoCloud';
export const CUSTOM_FLAVOR = 'Custom';
export const FLAVOR_LABEL = 'kubevirt.io/flavor';
export const KUBEVIRT_API_VERSION = 'kubevirt.io/v1alpha3';
export const OS_LABEL = 'kubevirt.io/os';
export const POD_NETWORK = 'Pod Networking';

export const DEVICE_TYPE_INTERFACE = 'interfaces';
export const DEVICE_TYPE_DISK = 'disks';

export const PROVISION_SOURCE_PXE = 'PXE';
export const PROVISION_SOURCE_CONTAINER = 'Container';
export const PROVISION_SOURCE_URL = 'URL';
export const PROVISION_SOURCE_IMPORT = 'Import';

export const PVC_ACCESSMODE_RWO = 'ReadWriteOnce';

export const TEMPLATE_API_VERSION = 'template.openshift.io/v1';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.cnv.io';
export const TEMPLATE_OS_LABEL = 'os.template.cnv.io';
export const TEMPLATE_PARAM_VM_NAME = 'NAME';
export const TEMPLATE_PARAM_VM_NAME_DESC = 'Name for the new VM';
export const TEMPLATE_TYPE_LABEL = 'template.cnv.io/type';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.cnv.io';
export const TEMPLATE_VM_NAME_LABEL = 'vm.cnv.io/name';
export const TEMPLATE_OS_NAME_ANNOTATION = 'name.os.template.cnv.io';

export const VIRTIO_BUS = 'virtio';

export const BOOT_ORDER_FIRST = 1;
export const BOOT_ORDER_SECOND = 2;

export const VALIDATION_ERROR_TYPE = 'error';
export const VALIDATION_WARNING_TYPE = 'warning';
export const VALIDATION_INFO_TYPE = 'info';

export const OS_WINDOWS_PREFIX = 'win';

export const VM_STATUS_OFF = 'VM_STATUS_OFF';
export const VM_STATUS_RUNNING = 'VM_STATUS_RUNNING';
export const VM_STATUS_STARTING = 'VM_STATUS_STARTING';
export const VM_STATUS_VMI_WAITING = 'VM_STATUS_VMI_WAITING';
export const VM_STATUS_IMPORTING = 'VM_STATUS_IMPORTING';
export const VM_STATUS_POD_ERROR = 'VM_STATUS_POD_ERROR';
export const VM_STATUS_ERROR = 'VM_STATUS_ERROR';
export const VM_STATUS_IMPORT_ERROR = 'VM_STATUS_IMPORT_ERROR';
export const VM_STATUS_UNKNOWN = 'VM_STATUS_UNKNOWN';
export const VM_STATUS_MIGRATING = 'VM_STATUS_MIGRATING';
export const VM_STATUS_OTHER = 'VM_STATUS_OTHER'; // used for grouping filters

export const VM_STATUS_ALL = [VM_STATUS_RUNNING, VM_STATUS_OFF, VM_STATUS_OTHER];

export const VM_STATUS_TO_TEXT = {
  [VM_STATUS_RUNNING]: 'Running',
  [VM_STATUS_OFF]: 'Off',
  [VM_STATUS_OTHER]: 'Other',
};

export const DEFAULT_RDP_PORT = 3389;
export const DASHES = '---';

export const CDI_KUBEVIRT_IO = 'cdi.kubevirt.io';
export const STORAGE_IMPORT_PVC_NAME = 'storage.import.importPvcName';

export const VCENTER_TYPE_LABEL = 'cnv.io/vcenter';
export const VCENTER_TEMPORARY_LABEL = 'cnv.io/temporary';
