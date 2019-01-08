import { get } from 'lodash';

import {
  ANNOTATION_USED_TEMPLATE,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  OS_WINDOWS_PREFIX,
} from '../constants';

export const getName = value => get(value, 'metadata.name');
export const getNamespace = value => get(value, 'metadata.namespace');

export const getGibStorageSize = (units, resources) => {
  const size = get(resources, 'requests.storage');
  return size ? units.dehumanize(size, 'binaryBytesWithoutB').value / 1073741824 : null; // 1024^3
};

export const getPvcResources = pvc => get(pvc, 'spec.resources');
export const getDataVolumeResources = dataVolume => get(dataVolume, 'spec.pvc.resources');

export const getPvcStorageClassName = pvc => get(pvc, 'spec.storageClassName');

export const getDataVolumeStorageClassName = dataVolume => get(dataVolume, 'spec.pvc.storageClassName');

export const getDisks = vm => get(vm, 'spec.template.spec.domain.devices.disks', []);
export const getInterfaces = vm => get(vm, 'spec.template.spec.domain.devices.interfaces', []);
export const getNetworks = vm => get(vm, 'spec.template.spec.networks', []);
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getDataVolumes = vm => get(vm, 'spec.dataVolumeTemplates', []);
export const getMemory = vm => get(vm, 'spec.template.spec.domain.resources.requests.memory');
export const getCpu = vm => get(vm, 'spec.template.spec.domain.cpu.cores');
export const getOperatingSystem = vm => getLabelValue(vm, TEMPLATE_OS_LABEL);
export const getWorkloadProfile = vm => getLabelValue(vm, TEMPLATE_WORKLOAD_LABEL);
export const getFlavor = vm => getLabelValue(vm, TEMPLATE_FLAVOR_LABEL);
export const getVmTemplate = vm => {
  const vmTemplate = getLabelValue(vm, ANNOTATION_USED_TEMPLATE);
  if (vmTemplate) {
    const templateParts = vmTemplate.split('_');
    return {
      name: templateParts[1],
      namespace: templateParts[0],
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
    if (disks.find(disk => disk.volumeName === cloudInitVolume.name)) {
      return cloudInitVolume;
    }
  }
  return null;
};

export const getCloudInitUserData = vm => {
  const volume = getCloudInitVolume(vm);
  return volume && volume.cloudInitNoCloud.userData;
};

export const getLabelValue = (vm, label) => {
  const labels = get(vm, 'metadata.labels', {});
  const labelKey = Object.keys(labels).find(key => key.startsWith(label));
  if (!labelKey) {
    return null;
  }
  if (labelKey.includes('/')) {
    const labelParts = labelKey.split('/');
    return labelParts[labelParts.length - 1];
  }
  return labels[labelKey];
};

export const isWindows = vm => (getOperatingSystem(vm) || '').startsWith(OS_WINDOWS_PREFIX);
export const getNodeName = pod => get(pod, 'spec.nodeName');

export const getVmiIpAddresses = vmi => get(vmi, 'status.interfaces', []).map(i => i.ipAddress);
