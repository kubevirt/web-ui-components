import { get } from 'lodash';

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
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getDataVolumes = vm => get(vm, 'spec.dataVolumeTemplates', []);
