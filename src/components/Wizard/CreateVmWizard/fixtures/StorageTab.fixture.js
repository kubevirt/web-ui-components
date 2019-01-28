import { StorageTab } from '../StorageTab';
import { units, storageClasses } from './CreateVmWizard.fixture';
import { PROVISION_SOURCE_URL } from '../../../../constants';
import { STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC } from '../constants';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim';

export const rows = [
  {
    id: 1,
    isBootable: true,
    name: 'D',
    size: '15',
    storageClass: 'iscsi',
    renderConfig: 0,
    storageType: STORAGE_TYPE_DATAVOLUME,
  },
  {
    id: 2,
    isBootable: false,
    renderConfig: 1,
    name: 'disk Two',
    size: '15',
    storageClass: 'glusterfs',
    storageType: STORAGE_TYPE_PVC,
  },
  {
    id: 3,
    isBootable: false,
    renderConfig: 1,
    storageType: STORAGE_TYPE_PVC,
  },
];

export default [
  {
    component: StorageTab,
    props: {
      persistentVolumeClaims,
      storageClasses,
      onChange: () => {},
      initialStorages: [],
      units,
      sourceType: PROVISION_SOURCE_URL,
      namespace: 'default',
    },
  },
];
