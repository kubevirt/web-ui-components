import {
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_CLONED_DISK,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
} from '../../../../constants';
import {
  STORAGE_TYPE_CONTAINER,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_EXTERNAL_IMPORT,
} from '../constants';

const possibleBootabilityResolver = {
  [PROVISION_SOURCE_URL]: disk => disk.rootStorage || disk.storageType === STORAGE_TYPE_DATAVOLUME,
  [PROVISION_SOURCE_PXE]: disk =>
    disk.rootStorage || disk.storageType === STORAGE_TYPE_PVC || disk.storageType === STORAGE_TYPE_DATAVOLUME,
  [PROVISION_SOURCE_CONTAINER]: disk => disk.rootStorage || disk.storageType === STORAGE_TYPE_CONTAINER,
  [PROVISION_SOURCE_CLONED_DISK]: disk => disk.rootStorage || disk.storageType === STORAGE_TYPE_PVC,
  [PROVISION_SOURCE_IMPORT]: disk => disk.storageType === STORAGE_TYPE_EXTERNAL_IMPORT,
};

const noNeedForBootableDisksResolver = new Set([PROVISION_SOURCE_PXE, PROVISION_SOURCE_IMPORT]);

export const canBeBootable = (disk, sourceType) => {
  const resolver = possibleBootabilityResolver[sourceType];
  return resolver && resolver(disk);
};

export const needsBootableDisk = (disks, sourceType) => {
  if (noNeedForBootableDisksResolver.has(sourceType)) {
    return false;
  }
  return !disks.some(disk => canBeBootable(disk, sourceType) && disk.isBootable);
};
