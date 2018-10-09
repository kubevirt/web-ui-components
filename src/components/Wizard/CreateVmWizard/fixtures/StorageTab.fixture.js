import StorageTab from '../StorageTab';
import { persistentVolumeClaims, storageClasses, units } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';

export const rows = [
  {
    id: 1,
    isBootable: true,
    name: 'D',
    size: '15',
    storageClass: 'iscsi',
    renderConfig: 0
  },
  {
    id: 2,
    isBootable: false,
    renderConfig: 1,
    attachStorage: {
      id: 'disk-two',
      name: 'disk Two',
      size: '15',
      storageClass: 'glusterfs'
    }
  },
  {
    id: 3,
    isBootable: false,
    renderConfig: 1,
    attachStorage: {}
  }
];

export default [
  {
    component: StorageTab,
    props: {
      persistentVolumeClaims,
      storageClasses,
      onChange: () => {},
      initialStorages: [],
      units
    }
  }
];
