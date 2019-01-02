import { forEach, get, has } from 'lodash';
import { safeLoad } from 'js-yaml';
import {
  ANNOTATION_USED_TEMPLATE,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
} from '../constants';

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
export const getNetworks = vm => get(vm, 'spec.template.spec.networks', []);
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getDataVolumes = vm => get(vm, 'spec.dataVolumeTemplates', []);
export const getMemory = vm => get(vm, 'spec.template.spec.domain.resources.requests.memory');
export const getCpu = vm => get(vm, 'spec.template.spec.domain.cpu.cores');
export const getOperatingSystem = vm => getLabelValue(vm, TEMPLATE_OS_LABEL);
export const getWorkloadProfile = vm => getLabelValue(vm, TEMPLATE_WORKLOAD_LABEL);
export const getFlavor = vm => getLabelValue(vm, TEMPLATE_FLAVOR_LABEL);
export const getVmTemplate = vm => getLabelValue(vm, ANNOTATION_USED_TEMPLATE);
export const getDescription = vm => get(vm, 'metadata.annotations.description');
export const getCloudInitData = vm => {
  const volumes = getVolumes(vm);
  const cloudInitVolume = volumes.find(volume => volume.cloudInitNoCloud && volume.cloudInitNoCloud.userData);

  if (cloudInitVolume) {
    // make sure volume is used by disk
    const disks = getDisks(vm);
    if (disks.find(disk => disk.volumeName === cloudInitVolume.name)) {
      return {
        userData: safeLoad(cloudInitVolume.cloudInitNoCloud.userData),
      };
    }
  }
  return null;
};
export const getLabelValue = (vm, label) => {
  let value;
  if (has(vm, 'metadata.labels')) {
    forEach(Object.keys(vm.metadata.labels), key => {
      if (key.startsWith(label)) {
        const keyParts = key.split('/');
        if (keyParts.length === 1) {
          value = vm.metadata.labels[key];
        } else if (keyParts.length === 2) {
          const [, labelValue] = keyParts;
          value = labelValue;
        }
        return false;
      }
      return true;
    });
  }

  return value;
};

export const getNodeName = pod => get(pod, 'spec.nodeName');
