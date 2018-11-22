import { fedora28 } from '../k8s/mock_templates/fedora28.mock';
import { rhel75 } from '../k8s/mock_templates/rhel75.mock';
import { ubuntu1804 } from '../k8s/mock_templates/ubuntu1804.mock';
import { rhelHighPerformance } from '../k8s/mock_templates/rhel-high-p.mock';
import { windows } from '../k8s/mock_templates/windows.mock';
import { linuxUserTemplate } from '../k8s/mock_user_templates/linux.mock';
import { windowsUserTemplate } from '../k8s/mock_user_templates/windows.mock';
import { network1 } from '../k8s/mock_network/network.mock';
import { network2 } from '../k8s/mock_network/network2.mock';

export const ANNOTATION_DEFAULT_DISK = 'defaults.template.cnv.io/disk';
export const ANNOTATION_DEFAULT_NETWORK = 'defaults.template.cnv.io/network';
export const ANNOTATION_FIRST_BOOT = 'cnv.ui.firstBoot';
export const ANNOTATION_PXE_INTERFACE = 'cnv.ui.pxeInterface';
export const ANNOTATION_USED_TEMPLATE = 'template.cnv.ui';

export const CLOUDINIT_DISK = 'cloudinitdisk';
export const CLOUDINIT_NOCLOUD = 'cloudInitNoCloud';
export const CLOUDINIT_VOLUME = 'cloudinitvolume';
export const CUSTOM_FLAVOR = 'Custom';
export const FLAVOR_LABEL = 'kubevirt.io/flavor';
export const KUBEVIRT_API_VERSION = 'kubevirt.io/v1alpha2';
export const OS_LABEL = 'kubevirt.io/os';
export const POD_NETWORK = 'Pod Networking';

export const PROVISION_SOURCE_PXE = 'PXE';
export const PROVISION_SOURCE_REGISTRY = 'Registry';
export const PROVISION_SOURCE_TEMPLATE = 'Template';
export const PROVISION_SOURCE_URL = 'URL';

export const PVC_ACCESSMODE_RWO = 'ReadWriteOnce';

export const REGISTRY_DISK = 'registrydisk';
export const REGISTRY_VOLUME = 'registryvolume';

export const TEMPLATE_API_VERSION = 'template.openshift.io/v1';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.cnv.io';
export const TEMPLATE_OS_LABEL = 'os.template.cnv.io';
export const TEMPLATE_PARAM_VM_NAME = 'NAME';
export const TEMPLATE_TYPE_LABEL = 'template.cnv.io/type';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.cnv.io';

export const VIRTIO_BUS = 'virtio';

export const BOOT_ORDER_FIRST = 1;
export const BOOT_ORDER_SECOND = 2;

export const VALIDATION_ERROR_TYPE = 'error';
export const VALIDATION_WARNING_TYPE = 'warning';
export const VALIDATION_INFO_TYPE = 'info';

export const baseTemplates = [fedora28, ubuntu1804, rhel75, rhelHighPerformance, windows];
export const networkConfigs = [network1, network2];
export const userTemplates = [linuxUserTemplate, windowsUserTemplate];
export const templates = [...baseTemplates, ...userTemplates];

export const VM_STATUS_OFF = 'VM_STATUS_OFF';
export const VM_STATUS_RUNNING = 'VM_STATUS_RUNNING';
export const VM_STATUS_STARTING = 'VM_STATUS_STARTING';
export const VM_STATUS_IMPORTING = 'VM_STATUS_IMPORTING';
export const VM_STATUS_POD_ERROR = 'VM_STATUS_POD_ERROR';
export const VM_STATUS_ERROR = 'VM_STATUS_ERROR';
export const VM_STATUS_IMPORT_ERROR = 'VM_STATUS_IMPORT_ERROR';
export const VM_STATUS_UNKNOWN = 'VM_STATUS_UNKNOWN';
export const VM_STATUS_ERROR_COMMON = 'VM_STATUS_ERROR_COMMON'; // VM_STATUS_ERROR and VM_STATUS_POD_ERROR are filtered together

export const VM_STATUS_ALL = [
  VM_STATUS_RUNNING,
  VM_STATUS_STARTING,
  VM_STATUS_OFF,
  VM_STATUS_ERROR_COMMON,
  VM_STATUS_UNKNOWN,
];

export const VM_STATUS_TO_TEXT = {
  [VM_STATUS_RUNNING]: 'Running',
  [VM_STATUS_STARTING]: 'Starting',
  [VM_STATUS_OFF]: 'Off',
  [VM_STATUS_IMPORTING]: 'Importing',
  [VM_STATUS_UNKNOWN]: 'Unknown',
  [VM_STATUS_ERROR_COMMON]: 'Error',
};
