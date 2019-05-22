import { STORAGE_TYPE_CONTAINER, STORAGE_TYPE_DATAVOLUME } from '../../constants';
import {
  PROVISION_SOURCE_CLONED_DISK,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
} from '../../../../../constants';

// left intentionally empty
export const TEMPLATE_ROOT_STORAGE = {};

const rootDisk = {
  rootStorage: {},
  name: 'rootdisk',
  isBootable: true,
};
export const rootContainerDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_CONTAINER,
};
export const rootDataVolumeDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_DATAVOLUME,
  size: 10,
};
export const getInitialDisk = provisionSource => {
  switch (provisionSource) {
    case PROVISION_SOURCE_URL:
      return rootDataVolumeDisk;
    case PROVISION_SOURCE_CONTAINER:
      return rootContainerDisk;
    case PROVISION_SOURCE_PXE:
    case PROVISION_SOURCE_CLONED_DISK:
    case PROVISION_SOURCE_IMPORT:
    default:
      return null;
  }
};

export const getStorageInitialState = props => ({
  value: [],
  valid: true, // empty Storages are valid
});
