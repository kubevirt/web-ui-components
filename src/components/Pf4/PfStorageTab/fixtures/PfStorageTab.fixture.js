import { PfStorageTab } from '../PfStorageTab';

import { units, storageClasses } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { PROVISION_SOURCE_URL } from '../../../../constants/index';
import { STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC } from '../../../Wizard/CreateVmWizard/constants';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim/index';

export const rows = [
  {
    data: {
      name: 'D',
      size: '20',
      isBootable: true,
      storageClass: 'iscsi',
      storageType: STORAGE_TYPE_DATAVOLUME,
    },
    cells: ['', '', ''],
  },
  {
    data: {
      isBootable: false,
      name: persistentVolumeClaims[0].metadata.name,
      storageType: STORAGE_TYPE_PVC,
    },
    cells: ['', '', ''],
  },
  {
    data: {
      isBootable: false,
      name: persistentVolumeClaims[1].metadata.name,
      storageType: STORAGE_TYPE_PVC,
    },
    cells: ['', '', ''],
  },
];

export default [
  {
    component: PfStorageTab,
    props: {
      persistentVolumeClaims,
      storageClasses,
      onChange: () => {},
      initialStorages: rows,
      units,
      sourceType: PROVISION_SOURCE_URL,
      namespace: 'default',
    },
  },
];
