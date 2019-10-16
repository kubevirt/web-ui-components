import { get } from 'lodash';

import { getStorageSize } from '../common';

export const getGibStorageSize = (units, resources) => {
  const size = get(resources, 'requests.storage');
  return size ? units.dehumanize(size, 'binaryBytesWithoutB').value / 1073741824 : null; // 1024^3
};

export const getPvcStorageSize = pvc => getStorageSize(getPvcResources(pvc));

export const getPvcResources = pvc => get(pvc, 'spec.resources');
export const getPvcAccessModes = pvc => get(pvc, 'spec.accessModes');
export const getPvcVolumeMode = (pvc, defaultValue) => get(pvc, 'spec.volumeMode', defaultValue);
export const getPvcStorageClassName = pvc => get(pvc, 'spec.storageClassName');
