import { fedora28 } from '../k8s/mock_templates/fedora28.template';
import { rhel75 } from '../k8s/mock_templates/rhel75.template';
import { ubuntu1804 } from '../k8s/mock_templates/ubuntu1804.template';
import { rhelHighPerformance } from '../k8s/mock_templates/rhel-high-p.template';
import { windows } from '../k8s/mock_templates/windows.template';
import { linuxUserTemplate } from '../k8s/mock_user_templates/linux.template';
import { windowsUserTemplate } from '../k8s/mock_user_templates/windows.template';
import { network1 } from '../k8s/mock_network/network.template';
import { network2 } from '../k8s/mock_network/network2.template';

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

export const baseTemplates = [fedora28, ubuntu1804, rhel75, rhelHighPerformance, windows];
export const networkConfigs = [network1, network2];
export const userTemplates = [linuxUserTemplate, windowsUserTemplate];
export const templates = [...baseTemplates, ...userTemplates];
