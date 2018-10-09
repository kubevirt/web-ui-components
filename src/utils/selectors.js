import { get } from 'lodash';

export const getName = value => get(value, 'metadata.name');
export const getNamespace = value => get(value, 'metadata.namespace');

export const getGibStorageSize = (units, object) => {
  const size = get(object, 'spec.resources.requests.storage');
  return size ? units.dehumanize(size, 'binaryBytesWithoutB').value / 1073741824 : null; // 1024^3
};

export const getStorageClassName = object => get(object, 'spec.storageClassName');

export const getDisks = vm => get(vm, 'spec.template.spec.domain.devices.disks', []);
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getPersistentVolumeClaimName = volume => get(volume, 'persistentVolumeClaim.claimName');
