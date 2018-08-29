import {
  API_VERSION,
  VM_KIND,
  OS_LABEL,
  FLAVOR_LABEL,
  REGISTRY_DISK,
  REGISTRY_VOLUME,
  CLOUDINIT_DISK,
  CLOUDINIT_VOLUME,
  VIRTIO_BUS
} from '../constants';
import { get } from 'lodash';

export const createVM = (basicSettings, network, storage) => {
  const vm = generateVmJson(basicSettings, network, storage);

  createK8sObject(vm);
};

export const generateVmJson = (basicSettings, network, storage) => {
  const vm = {
    apiVersion: API_VERSION,
    kind: VM_KIND,
    metadata: {
      name: basicSettings.name.value,
      namespace: basicSettings.namespace.value,
      labels: {
        [OS_LABEL]: basicSettings.operatingSystem.value
      }
    },
    spec: {
      template: {}
    }
  };

  if (basicSettings.namespace) {
    vm.metadata.namespace = basicSettings.namespace.value;
  }

  if (basicSettings.description) {
    vm.metadata.labels.description = basicSettings.description.value;
  }

  addFlavor(vm, basicSettings);
  addImageSourceType(vm, basicSettings);
  addCloudInit(vm, basicSettings);

  vm.spec.running = basicSettings.startVM ? basicSettings.startVM.value : false;

  return vm;
};

const addFlavor = (vm, basicSettings) => {
  if (basicSettings.flavor.value === 'Custom') {
    vm.spec.template.spec = {
      domain: {
        cpu: {
          cores: parseInt(basicSettings.cpu.value, 10)
        },
        resources: {
          requests: {
            memory: `${basicSettings.memory.value}Gi`
          }
        }
      }
    };
  } else {
    vm.spec.template.spec = {
      metadata: {
        labels: {
          [FLAVOR_LABEL]: basicSettings.flavor.value
        }
      }
    };
  }
};

const addImageSourceType = (vm, basicSettings) => {
  if (get(basicSettings.imageSourceType, 'value') === 'Registry') {
    const registryDisk = {
      name: REGISTRY_DISK,
      volumeName: REGISTRY_VOLUME,
      disk: {
        bus: VIRTIO_BUS
      }
    };
    addDisk(vm, registryDisk);

    const registryVolume = {
      name: REGISTRY_VOLUME,
      registryDisk: {
        image: basicSettings.registryImage.value
      }
    };

    addVolume(vm, registryVolume);
  }
};

const addCloudInit = (vm, basicSettings) => {
  if (get(basicSettings.cloudInit, 'value', false)) {
    const cloudInitDisk = {
      name: CLOUDINIT_DISK,
      volumeName: CLOUDINIT_VOLUME,
      disk: {
        bus: VIRTIO_BUS
      }
    };
    addDisk(vm, cloudInitDisk);

    let userData = '';
    let keys = '';
    let userName = '';
    keys = appendToUserData(keys, 'ssh-authorized-keys', basicSettings.authKeys.value);
    userName = appendToUserData(userName, 'name', 'root');

    userData = appendToUserData(userData, 'users', `${userName}\n    ${keys}`);
    if (get(basicSettings.hostname, 'value')) {
      userData = appendToUserData(userData, 'hostname', basicSettings.hostname.value);
    }

    const cloudInitVolume = {
      name: CLOUDINIT_VOLUME,
      cloudInitNoCloud: {
        userData
      }
    };

    addVolume(vm, cloudInitVolume);
  }
};

const addDisk = (vm, diskSpec) => {
  const domain = get(vm.spec.template.spec, 'domain', {});
  const devices = get(domain, 'devices', {});
  const disks = get(devices, 'disks', []);
  disks.push(diskSpec);
  devices.disks = disks;
  domain.devices = devices;
  vm.spec.template.spec.domain = domain;
};

const addVolume = (vm, volumeSpec) => {
  const volumes = get(vm.spec.template.spec, 'volumes', []);
  volumes.push(volumeSpec);
  vm.spec.template.spec.volumes = volumes;
};

const appendToUserData = (userData, key, value) => {
  if (userData !== '') {
    userData += '\n';
  }
  userData += `${key}:\n  - ${value}`;
  return userData;
};

export const createK8sObject = k8sObject => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(k8sObject, null, 2));
};
