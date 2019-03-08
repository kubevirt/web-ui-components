import { get } from 'lodash';

import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  OS_WINDOWS_PREFIX,
  TEMPLATE_OS_NAME_ANNOTATION,
} from '../constants';
import {
  DATA_VOLUME_SOURCE_URL,
  DATA_VOLUME_SOURCE_PVC,
  DATA_VOLUME_SOURCE_BLANK,
} from '../components/Wizard/CreateVmWizard/constants';

export const getId = value => `${getNamespace(value)}-${getName(value)}`;
export const getName = value => get(value, 'metadata.name');
export const getNamespace = value => get(value, 'metadata.namespace');

export const getGibStorageSize = (units, resources) => {
  const size = get(resources, 'requests.storage');
  return size ? units.dehumanize(size, 'binaryBytesWithoutB').value / 1073741824 : null; // 1024^3
};

export const getStorageSize = resources => get(resources, 'requests.storage');

export const getPvcStorageSize = pvc => getStorageSize(getPvcResources(pvc));
export const getDataVolumeStorageSize = dataVolume => getStorageSize(getDataVolumeResources(dataVolume));

export const getPvcResources = pvc => get(pvc, 'spec.resources');
export const getDataVolumeResources = dataVolume => get(dataVolume, 'spec.pvc.resources');

export const getPvcAccessModes = pvc => get(pvc, 'spec.accessModes');
export const getDataVolumeAccessModes = dataVolume => get(dataVolume, 'spec.pvc.accessModes');

export const getPvcStorageClassName = pvc => get(pvc, 'spec.storageClassName');

export const getDataVolumeStorageClassName = dataVolume => get(dataVolume, 'spec.pvc.storageClassName');
export const getDataVolumeSourceType = dataVolume => {
  const source = get(dataVolume, 'spec.source');
  if (source.http) {
    return {
      type: DATA_VOLUME_SOURCE_URL,
      url: get(dataVolume, 'spec.source.http.url'),
    };
  }
  if (source.pvc) {
    return {
      type: DATA_VOLUME_SOURCE_PVC,
      name: get(dataVolume, 'spec.source.pvc.name'),
      namespace: get(dataVolume, 'spec.source.pvc.namespace'),
    };
  }
  if (source.blank) {
    return {
      type: DATA_VOLUME_SOURCE_BLANK,
    };
  }
  return null;
};

export const getDisks = vm => get(vm, 'spec.template.spec.domain.devices.disks', []);
export const getInterfaces = vm => get(vm, 'spec.template.spec.domain.devices.interfaces', []);
export const getNetworks = vm => get(vm, 'spec.template.spec.networks', []);
export const getVolumes = vm => get(vm, 'spec.template.spec.volumes', []);
export const getDataVolumeTemplates = vm => get(vm, 'spec.dataVolumeTemplates', []);
export const getMemory = vm => get(vm, 'spec.template.spec.domain.resources.requests.memory');
export const getCpu = vm => get(vm, 'spec.template.spec.domain.cpu.cores');
export const getOperatingSystem = vm => getLabelKeyValue(vm, TEMPLATE_OS_LABEL);
export const getOperatingSystemName = vm =>
  getAnnotationValue(vm, `${TEMPLATE_OS_NAME_ANNOTATION}/${getOperatingSystem(vm)}`);
export const getWorkloadProfile = vm => getLabelKeyValue(vm, TEMPLATE_WORKLOAD_LABEL);
export const getFlavor = vm => getLabelKeyValue(vm, TEMPLATE_FLAVOR_LABEL);
export const getVmTemplate = vm => {
  const vmTemplateName = getLabelValue(vm, LABEL_USED_TEMPLATE_NAME);
  const vmTemplateNamespace = getLabelValue(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  if (vmTemplateName && vmTemplateNamespace) {
    return {
      name: vmTemplateName,
      namespace: vmTemplateNamespace,
    };
  }
  return null;
};
export const getDescription = vm => get(vm, 'metadata.annotations.description');
export const getCloudInitVolume = vm => {
  const volumes = getVolumes(vm);
  const cloudInitVolume = volumes.find(volume => volume.cloudInitNoCloud && volume.cloudInitNoCloud.userData);

  if (cloudInitVolume) {
    // make sure volume is used by disk
    const disks = getDisks(vm);
    if (disks.find(disk => disk.name === cloudInitVolume.name)) {
      return cloudInitVolume;
    }
  }
  return null;
};

export const getCloudInitUserData = vm => {
  const volume = getCloudInitVolume(vm);
  return volume && volume.cloudInitNoCloud.userData;
};

export const getLabelKeyValue = (vm, label) => {
  const labels = get(vm, 'metadata.labels', {});
  return readValueFromObject(labels, label, true);
};

export const getLabelValue = (vm, label) => get(vm, ['metadata', 'labels', label]);

export const getAnnotationValue = (vm, annotation) => {
  const annotations = get(vm, 'metadata.annotations', {});
  return readValueFromObject(annotations, annotation, false);
};

const readValueFromObject = (objects, key, split) => {
  if (objects) {
    const objectKey = Object.keys(objects).find(objKey => objKey.startsWith(key));
    if (!objectKey) {
      return null;
    }
    if (split && objectKey.includes('/')) {
      const objectParts = objectKey.split('/');
      return objectParts[objectParts.length - 1];
    }
    return objects[objectKey];
  }
  return null;
};

export const isWindows = vm => (getOperatingSystem(vm) || '').startsWith(OS_WINDOWS_PREFIX);

export const getNodeName = pod => get(pod, 'spec.nodeName');
export const getHostName = pod => get(pod, 'spec.hostname');

export const getVmiIpAddresses = vmi =>
  get(vmi, 'status.interfaces', [])
    // get IPs only for named interfaces because Windows reports IPs for other devices like Loopback Pseudo-Interface 1 etc.
    .filter(i => i.name)
    .map(i => i.ipAddress)
    .filter(ip => ip && ip.trim().length > 0);

export const getFlavorDescription = vm => {
  const cpu = getCpu(vm);
  const memory = getMemory(vm);
  const cpuStr = cpu ? `${cpu} CPU` : '';
  const memoryStr = memory ? `${memory} Memory` : '';
  const resourceStr = cpuStr && memoryStr ? `${cpuStr}, ${memoryStr}` : `${cpuStr}${memoryStr}`;
  return resourceStr || undefined;
};

export const isGuestAgentConnected = vmi =>
  get(vmi, 'status.conditions', []).some(
    condition => condition.type === 'AgentConnected' && condition.status === 'True'
  );

export const getHostStatus = host => get(host, ['metadata', 'labels', 'metalkube.org/operational-status']);
