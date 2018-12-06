import { get } from 'lodash';
import { safeLoad } from 'js-yaml';

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
export const getOperatingSystem = vm => get(vm, 'metadata.labels["os.template.cnv.io"]');
export const getWorkloadProfile = vm => get(vm, 'metadata.labels["workload.template.cnv.io"]');
export const getFlavor = vm => get(vm, 'metadata.labels["flavor.template.cnv.io"]');
export const getVmTemplate = vm => get(vm, 'metadata.annotations["template.cnv.ui"]');
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

export const getNodeName = pod => get(pod, 'spec.nodeName');
