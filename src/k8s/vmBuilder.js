import { get } from 'lodash';

import { PROVISION_SOURCE_PXE, BOOT_ORDER_FIRST, BOOT_ORDER_SECOND, PVC_ACCESSMODE_RWO } from '../constants';

import {
  PROVISION_SOURCE_TYPE_KEY,
  CONTAINER_IMAGE_KEY,
  NETWORK_TYPE_MULTUS,
  NETWORK_TYPE_POD,
  DATA_VOLUME_SOURCE_URL,
  DATA_VOLUME_SOURCE_BLANK,
} from '../components/Wizard/CreateVmWizard/constants';

export const addDisk = (vm, defaultDisk, storage, getSetting) => {
  const diskSpec = {
    ...(storage.templateStorage ? storage.templateStorage.disk : defaultDisk),
    name: storage.name,
  };
  if (storage.isBootable) {
    const imageSource = getSetting(PROVISION_SOURCE_TYPE_KEY);
    diskSpec.bootOrder = imageSource === PROVISION_SOURCE_PXE ? BOOT_ORDER_SECOND : BOOT_ORDER_FIRST;
  } else {
    delete diskSpec.bootOrder;
  }
  const disks = getDisks(vm);
  disks.push(diskSpec);
};

export const addContainerVolume = (vm, storage, getSetting) => {
  const volume = {
    ...(storage.templateStorage ? storage.templateStorage.volume : {}),
    name: storage.name,
    containerDisk: {
      ...(storage.templateStorage ? storage.templateStorage.volume.containerDisk : {}),
    },
  };
  if (storage.rootStorage) {
    volume.containerDisk.image = getSetting(CONTAINER_IMAGE_KEY);
  }
  addVolume(vm, volume);
};

export const addDataVolume = (vm, storage) => {
  const volume = {
    ...(storage.templateStorage ? storage.templateStorage.volume : {}),
    name: storage.name,
    dataVolume: {
      ...(storage.templateStorage ? storage.templateStorage.volume.dataVolume : {}),
      name: storage.dvName,
    },
  };
  addVolume(vm, volume);
};

export const addPvcVolume = (vm, storage) => {
  const volume = {
    ...(storage.templateStorage ? storage.templateStorage.volume : {}),
    name: storage.name,
    persistentVolumeClaim: {
      ...(storage.templateStorage ? storage.templateStorage.volume.persistentVolumeClaim : {}),
      claimName: storage.name,
    },
  };
  addVolume(vm, volume);
};

export const addVolume = (vm, volumeSpec) => {
  const volumes = getVolumes(vm);
  volumes.push(volumeSpec);
};

export const addDataVolumeTemplate = (vm, dataVolumeTemplate) => {
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  dataVolumeTemplates.push(dataVolumeTemplate);
  return dataVolumeTemplate;
};

export const addInterface = (vm, defaultInterface, network) => {
  const interfaceSpec = {
    ...(network.templateNetwork ? network.templateNetwork.interface : defaultInterface),
    name: network.name,
  };
  if (network.mac) {
    interfaceSpec.macAddress = network.mac;
  }
  if (network.isBootable) {
    interfaceSpec.bootOrder = BOOT_ORDER_FIRST;
  } else {
    delete interfaceSpec.bootOrder;
  }

  const interfaces = getInterfaces(vm);
  interfaces.push(interfaceSpec);
};

export const addNetwork = (vm, network) => {
  const networkSpec = {
    ...(network.templateNetwork ? network.templateNetwork.network : {}),
    name: network.name,
  };
  // TODO support unknown types
  switch (network.networkType) {
    case NETWORK_TYPE_MULTUS:
      networkSpec.multus = {
        ...(network.templateNetwork ? network.templateNetwork.network.multus : {}),
        networkName: network.network,
      };
      break;
    case NETWORK_TYPE_POD:
    default:
      networkSpec.pod = {};
      break;
  }
  const networks = getNetworks(vm);
  networks.push(networkSpec);
};

export const addAnnotation = (vm, key, value) => {
  const annotations = getAnnotations(vm);
  annotations[key] = value;
};

export const addLabel = (vm, key, value) => {
  const labels = getLabels(vm);
  labels[key] = value;
};

export const addTemplateLabel = (vm, key, value) => {
  const labels = getTemplateLabels(vm);
  labels[key] = value;
};

export const removeDisksAndVolumes = vm => {
  delete vm.spec.template.spec.domain.devices.disks;
  delete vm.spec.template.spec.volumes;
  delete vm.spec.dataVolumeTemplates;
};

export const removeInterfacesAndNetworks = vm => {
  delete vm.spec.template.spec.domain.devices.interfaces;
  delete vm.spec.template.spec.networks;
};

export const getDevices = vm => {
  const domain = getDomain(vm);
  if (!domain.devices) {
    domain.devices = {};
  }
  return domain.devices;
};

export const getDisks = vm => {
  const devices = getDevices(vm);
  if (!devices.disks) {
    devices.disks = [];
  }
  return devices.disks;
};

export const getDomain = vm => {
  const spec = getSpec(vm);
  if (!spec.domain) {
    spec.domain = {};
  }
  return spec.domain;
};

export const getInterfaces = vm => {
  const devices = getDevices(vm);
  if (!devices.interfaces) {
    devices.interfaces = [];
  }
  return devices.interfaces;
};

export const getVolumes = vm => {
  const spec = getSpec(vm);
  if (!spec.volumes) {
    spec.volumes = [];
  }
  return spec.volumes;
};

export const getVmSpec = vm => {
  if (!vm.spec) {
    vm.spec = {};
  }
  return vm.spec;
};

export const getSpec = vm => {
  const vmSpec = getVmSpec(vm);
  if (!vmSpec.template) {
    vmSpec.template = {
      spec: {},
    };
  } else if (!vmSpec.template.spec) {
    vmSpec.template.spec = {};
  }
  return vmSpec.template.spec;
};

export const getDevice = (vm, deviceType, deviceName) =>
  get(getDevices(vm), deviceType, []).find(device => device.name === deviceName);

export const getDataVolumeTemplates = vm => {
  const spec = getVmSpec(vm);
  if (!spec.dataVolumeTemplates) {
    spec.dataVolumeTemplates = [];
  }
  return spec.dataVolumeTemplates;
};

export const getNetworks = vm => {
  const spec = getSpec(vm);
  if (!spec.networks) {
    spec.networks = [];
  }
  return spec.networks;
};

export const getAnnotations = vm => {
  if (!vm.metadata.annotations) {
    vm.metadata.annotations = {};
  }
  return vm.metadata.annotations;
};

export const getLabels = vm => {
  if (!vm.metadata.labels) {
    vm.metadata.labels = {};
  }
  return vm.metadata.labels;
};

export const getTemplateLabels = vm => {
  const spec = getVmSpec(vm);
  if (!spec.template) {
    spec.template = {};
  }
  if (!spec.template.metadata) {
    spec.template.metadata = {};
  }
  if (!spec.template.metadata.labels) {
    spec.template.metadata.labels = {};
  }
  return spec.template.metadata.labels;
};

export const getDataVolumeTemplateSpec = (storage, dvSource) => {
  let source;
  switch (dvSource.type) {
    case DATA_VOLUME_SOURCE_URL:
      source = {
        http: {
          url: dvSource.url,
        },
      };
      break;
    case DATA_VOLUME_SOURCE_BLANK:
    default:
      source = {
        blank: {},
      };
  }

  return {
    metadata: {
      name: storage.dvName,
    },
    spec: {
      pvc: {
        accessModes: [PVC_ACCESSMODE_RWO],
        resources: {
          requests: {
            storage: `${storage.size}Gi`,
          },
        },
        storageClassName: storage.storageClass,
      },
      source,
    },
  };
};
