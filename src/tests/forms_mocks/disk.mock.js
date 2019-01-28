import { urlTemplate } from '../mocks/user_template';
import { STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC } from '../../components/Wizard/CreateVmWizard/constants';
import { persistentVolumeClaims } from '../mocks/persistentVolumeClaim';

export const pvcDisk = {
  id: 1,
  name: persistentVolumeClaims[2].metadata.name,
  storageType: STORAGE_TYPE_PVC,
};

export const templateDataVolumeDisk = {
  id: 2,
  templateStorage: {
    dataVolume: urlTemplate.objects[0].spec.dataVolumeTemplates[0],
    disk: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0],
    volume: urlTemplate.objects[0].spec.template.spec.volumes[0],
  },
  name: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0].name,
  storageType: STORAGE_TYPE_DATAVOLUME,
  isBootable: true,
};

export const dataVolumeDisk = {
  name: 'datavolumedisk',
  dvName: 'datavolumename',
};

export const dataVolumeTemplate = {
  name: 'datavolumetemplatedisk',
  dvName: 'datavolumename',
  size: 10,
};
