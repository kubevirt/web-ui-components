import { urlTemplateDataVolume, urlTemplate } from '../mocks/user_template/url.mock';
import { STORAGE_TYPE_DATAVOLUME, STORAGE_TYPE_PVC } from '../../components/Wizard/CreateVmWizard/constants';
import { persistentVolumeClaims } from '../mocks/persistentVolumeClaim';
import { dataVolumes } from '../mocks/dataVolume';
import { getName } from '../../utils';

export const pvcDisk = {
  id: 1,
  name: persistentVolumeClaims[2].metadata.name,
  storageType: STORAGE_TYPE_PVC,
};

export const templateDataVolumeDisk = {
  id: 2,
  templateStorage: {
    dataVolume: urlTemplateDataVolume,
    disk: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0],
    volume: urlTemplate.objects[0].spec.template.spec.volumes[0],
  },
  name: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0].name,
  storageType: STORAGE_TYPE_DATAVOLUME,
  isBootable: true,
};

export const dataVolumeDisk = {
  name: 'datavolumedisk',
  dvName: getName(dataVolumes.url),
};

export const dataVolumeTemplate = {
  name: 'datavolumetemplatedisk',
  dvName: getName(dataVolumes.url),
  size: 10,
};
