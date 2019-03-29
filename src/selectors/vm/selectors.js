import { get } from 'lodash';

import { getLabelValue, getLabelKeyValue, getAnnotationValue } from '../common';

import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  OS_WINDOWS_PREFIX,
  TEMPLATE_OS_NAME_ANNOTATION,
} from '../../constants';

export const getDisks = vm => get(vm, 'spec.template.spec.domain.devices.disks', []);
export const getInterfaces = vm => get(vm, 'spec.template.spec.domain.devices.interfaces', []);
export const getNetworks = vm => get(vm, 'spec.template.spec.networks', []);
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getDataVolumeTemplates = vm => get(vm, 'spec.dataVolumeTemplates', []);
export const getMemory = vm => get(vm, 'spec.template.spec.domain.resources.requests.memory');
export const getCpu = vm => get(vm, 'spec.template.spec.domain.cpu.cores');
export const getOperatingSystem = vm => getLabelKeyValue(vm, TEMPLATE_OS_LABEL);
export const getOperatingSystemName = vm =>
  getAnnotationValue(vm, `${TEMPLATE_OS_NAME_ANNOTATION}/${getOperatingSystem(vm)}`);
export const getWorkloadProfile = vm => getLabelKeyValue(vm, TEMPLATE_WORKLOAD_LABEL);
export const getFlavor = vm => getLabelKeyValue(vm, TEMPLATE_FLAVOR_LABEL);
export const getVmTemplate = vm => {
  const vmTemplateName = getLabelValue(vm, LABEL_USED_TEMPLATE_NAME);
  const vmTemplateNamespace = getLabelValue(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  if (vmTemplateName && vmTemplateNamespace) {
    return {
      name: vmTemplateName,
      namespace: vmTemplateNamespace,
    };
  }
  return null;
};
export const getDescription = vm => get(vm, 'metadata.annotations.description');
export const getCloudInitVolume = vm => {
  const volumes = getVolumes(vm);
  const cloudInitVolume = volumes.find(volume => volume.cloudInitNoCloud && volume.cloudInitNoCloud.userData);

  if (cloudInitVolume) {
    // make sure volume is used by disk
    const disks = getDisks(vm);
    if (disks.find(disk => disk.name === cloudInitVolume.name)) {
      return cloudInitVolume;
    }
  }
  return null;
};

export const getCloudInitUserData = vm => {
  const volume = getCloudInitVolume(vm);
  return volume && volume.cloudInitNoCloud.userData;
};

export const isWindows = vm => (getOperatingSystem(vm) || '').startsWith(OS_WINDOWS_PREFIX);

export const getFlavorDescription = vm => {
  const cpu = getCpu(vm);
  const memory = getMemory(vm);
  const cpuStr = cpu ? `${cpu} CPU` : '';
  const memoryStr = memory ? `${memory} Memory` : '';
  const resourceStr = cpuStr && memoryStr ? `${cpuStr}, ${memoryStr}` : `${cpuStr}${memoryStr}`;
  return resourceStr || undefined;
};

export const isVmRunning = vm => get(vm, 'spec.running', false);
export const isVmReady = vm => get(vm, 'status.ready', false);
export const isVmCreated = vm => get(vm, 'status.created', false);
