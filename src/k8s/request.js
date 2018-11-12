import { cloneDeep, get, partition, remove } from 'lodash';
import { safeDump } from 'js-yaml';
import {
  CLOUDINIT_DISK,
  CLOUDINIT_VOLUME,
  VIRTIO_BUS,
  ANNOTATION_DEFAULT_DISK,
  ANNOTATION_DEFAULT_NETWORK,
  TEMPLATE_PARAM_VM_NAME,
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_TEMPLATE,
  TEMPLATE_TYPE_BASE,
  PROVISION_SOURCE_PXE,
  POD_NETWORK,
  ANNOTATION_FIRST_BOOT,
  ANNOTATION_PXE_INTERFACE,
  TEMPLATE_API_VERSION,
  PVC_ACCESSMODE_RWO,
  CLOUDINIT_NOCLOUD,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  ANNOTATION_USED_TEMPLATE,
} from '../constants';
import {
  NAMESPACE_KEY,
  DESCRIPTION_KEY,
  IMAGE_SOURCE_TYPE_KEY,
  REGISTRY_IMAGE_KEY,
  IMAGE_URL_KEY,
  USER_TEMPLATE_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  CPU_KEY,
  START_VM_KEY,
  CLOUD_INIT_KEY,
  HOST_NAME_KEY,
  AUTHKEYS_KEY,
  NAME_KEY,
  OPERATING_SYSTEM_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../components/Wizard/CreateVmWizard/constants';
import { VirtualMachineModel, ProcessedTemplatesModel } from '../models';
import { getTemplatesWithLabels, getTemplate } from '../utils/templates';
import {
  getOsLabel,
  getWorkloadLabel,
  getFlavorLabel,
  getTemplateAnnotations,
  settingsValue,
  selectVm,
} from './selectors';

export const createVM = (k8sCreate, templates, basicSettings, { networks }, storage) => {
  const getSetting = settingsValue.bind(undefined, basicSettings);
  const [templateStorage, additionalStorage] = partition(storage, disk => disk.templateStorage);

  const template = resolveTemplate(templates, basicSettings, getSetting, templateStorage);

  return k8sCreate(ProcessedTemplatesModel, template).then(({ objects }) => {
    const vm = selectVm(objects);
    addMetadata(vm, template, getSetting);
    modifyVmObject(vm, template, getSetting, networks, additionalStorage);
    return k8sCreate(VirtualMachineModel, vm);
  });
};

const resolveTemplate = (templates, basicSettings, getSetting, storage) => {
  let chosenTemplate;

  if (getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE) {
    chosenTemplate = templates.find(template => template.metadata.name === getSetting(USER_TEMPLATE_KEY));
    if (!chosenTemplate) {
      return null;
    }
    chosenTemplate = cloneDeep(chosenTemplate);
    const vm = selectVm(chosenTemplate.objects);
    // clear
    removeDisksAndVolumes(vm);

    // add the ones selected by the user again
    storage
      .filter(disk => disk.templateStorage)
      .forEach(({ templateStorage: { dataVolume, disk, volume }, isBootable }) => {
        addDataVolumeTemplate(vm, dataVolume);
        addVolume(vm, volume);
        addBootableDisk(vm, disk, isBootable, getSetting);
      });
  } else {
    const baseTemplates = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(basicSettings),
      getWorkloadLabel(basicSettings),
      getFlavorLabel(basicSettings),
    ]);
    if (baseTemplates.length === 0) {
      return null;
    }
    chosenTemplate = cloneDeep(baseTemplates[0]);
  }

  setParameterValue(chosenTemplate, TEMPLATE_PARAM_VM_NAME, getSetting(NAME_KEY));

  // no more required parameters
  chosenTemplate.parameters.forEach(param => {
    if (param.name !== TEMPLATE_PARAM_VM_NAME && param.required) {
      delete param.required;
    }
  });

  // make sure api version is correct
  chosenTemplate.apiVersion = TEMPLATE_API_VERSION;

  return chosenTemplate;
};

const addMetadata = (vm, template, getSetting) => {
  const userTemplate = getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE;

  const flavor = userTemplate ? CUSTOM_FLAVOR : getSetting(FLAVOR_KEY);
  addAnnotation(vm, TEMPLATE_FLAVOR_LABEL, flavor);

  const os = userTemplate ? template.metadata.labels[TEMPLATE_OS_LABEL] : getSetting(OPERATING_SYSTEM_KEY);
  addAnnotation(vm, TEMPLATE_OS_LABEL, os);

  const workload = userTemplate ? template.metadata.labels[TEMPLATE_WORKLOAD_LABEL] : getSetting(WORKLOAD_PROFILE_KEY);
  addAnnotation(vm, TEMPLATE_WORKLOAD_LABEL, workload);

  addAnnotation(vm, ANNOTATION_USED_TEMPLATE, `${template.metadata.namespace}/${template.metadata.name}`);
};

const modifyVmObject = (vm, template, getSetting, networks, storages) => {
  setFlavor(vm, getSetting);
  setNetworks(vm, template, getSetting, networks);

  // add running status
  vm.spec.running = getSetting(START_VM_KEY, false);

  // add namespace
  const namespace = getSetting(NAMESPACE_KEY);
  if (namespace) {
    vm.metadata.namespace = namespace;
  }

  // add description
  const description = getSetting(DESCRIPTION_KEY);
  if (description) {
    addAnnotation(vm, 'description', description);
  }
  addStorages(vm, template, storages, getSetting);
};

const setFlavor = (vm, getSetting) => {
  if (getSetting(FLAVOR_KEY) === CUSTOM_FLAVOR || getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE) {
    vm.spec.template.spec.domain.cpu.cores = parseInt(getSetting(CPU_KEY), 10);
    vm.spec.template.spec.domain.resources.requests.memory = `${getSetting(MEMORY_KEY)}G`;
  }
};

const setParameterValue = (template, paramName, paramValue) => {
  const parameter = template.parameters.find(param => param.name === paramName);
  parameter.value = paramValue;
};

const setNetworks = (vm, template, getSetting, networks) => {
  const defaultInterface = getDefaultInterface(vm, template);
  const interfaceModel = defaultInterface ? defaultInterface.model : undefined;

  if (getSetting(IMAGE_SOURCE_TYPE_KEY) !== PROVISION_SOURCE_TEMPLATE) {
    delete vm.spec.template.spec.domain.devices.interfaces;
    delete vm.spec.template.spec.networks;
  }

  if (!networks.find(network => network.network === POD_NETWORK)) {
    getDevices(vm).autoattachPodInterface = false;
  }

  networks.forEach(network => {
    const nic = {
      bridge: {},
      name: network.name,
    };
    if (network.mac) {
      nic.macAddress = network.mac;
    }
    if (getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_PXE && network.isBootable) {
      nic.bootOrder = 1;
    }
    if (interfaceModel) {
      nic.model = interfaceModel;
    }

    const networkConfig = {
      name: network.name,
    };
    if (network.network === POD_NETWORK) {
      networkConfig.pod = {};
    } else {
      networkConfig.multus = {
        networkName: network.network,
      };
    }
    addInterface(vm, nic);
    addNetwork(vm, networkConfig);
  });

  if (getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_PXE) {
    addAnnotation(vm, ANNOTATION_PXE_INTERFACE, networks.find(network => network.isBootable).name);
    const startOnCreation = getSetting(START_VM_KEY, false);
    addAnnotation(vm, ANNOTATION_FIRST_BOOT, `${!startOnCreation}`);
  }
};

const addCloudInit = (vm, getSetting) => {
  // remove existing config
  const volumes = get(getSpec(vm), 'volumes', []);
  const existingVolume = volumes.find(volume => volume.hasOwnProperty(CLOUDINIT_NOCLOUD));
  if (existingVolume) {
    remove(getDisks(vm), disk => disk.volumeName === existingVolume.name);
    remove(volumes, volume => volume.name === existingVolume.name);
  }

  if (getSetting(CLOUD_INIT_KEY)) {
    const cloudInitDisk = {
      name: CLOUDINIT_DISK,
      volumeName: CLOUDINIT_VOLUME,
      disk: {
        bus: VIRTIO_BUS,
      },
    };
    addDisk(vm, cloudInitDisk);

    const userDataObject = {
      users: [
        {
          name: 'root',
          'ssh-authorized-keys': getSetting(AUTHKEYS_KEY),
        },
      ],
      hostname: getSetting(HOST_NAME_KEY),
    };

    const userData = safeDump(userDataObject);

    const userDataWithMagicHeader = `#cloud-config\n${userData}`;

    const cloudInitVolume = {
      name: CLOUDINIT_VOLUME,
      cloudInitNoCloud: {
        userData: userDataWithMagicHeader,
      },
    };

    addVolume(vm, cloudInitVolume);
  }
};

const addStorages = (vm, template, storages, getSetting) => {
  const imageSourceType = getSetting(IMAGE_SOURCE_TYPE_KEY);

  let defaultDisk = getDefaultDisk(vm, template);

  if (!defaultDisk) {
    defaultDisk = {
      disk: {
        bus: VIRTIO_BUS,
      },
    };
  }

  if (imageSourceType !== PROVISION_SOURCE_TEMPLATE) {
    delete vm.spec.template.spec.volumes;
    delete vm.spec.template.spec.domain.devices.disks;
  }

  addImageSourceDisks(vm, imageSourceType, defaultDisk, getSetting);

  if (storages) {
    for (const storage of storages) {
      if (storage.attachStorage) {
        addPersistentVolumeClaimVolume(vm, storage, defaultDisk, getSetting);
      } else {
        addDataVolume(vm, storage, defaultDisk, getSetting);
      }
    }
  }
  addCloudInit(vm, getSetting);
};

const addImageSourceDisks = (vm, imageSourceType, defaultDisk, getSetting) => {
  switch (imageSourceType) {
    case PROVISION_SOURCE_REGISTRY: {
      const registryDisk = {
        ...defaultDisk,
        name: 'rootdisk',
        volumeName: 'rootvolume',
      };
      const registryVolume = {
        name: 'rootvolume',
        registryDisk: {
          image: getSetting(REGISTRY_IMAGE_KEY),
        },
      };

      addDisk(vm, registryDisk);
      addVolume(vm, registryVolume);
      break;
    }
    case PROVISION_SOURCE_URL: {
      const dataVolumeName = `datavolume-${vm.metadata.name}`;
      const disk = {
        ...defaultDisk,
        name: 'rootdisk',
        volumeName: dataVolumeName,
      };

      const volume = {
        name: dataVolumeName,
        dataVolume: {
          name: dataVolumeName,
        },
      };
      const dataVolumeTemplate = {
        metadata: {
          name: dataVolumeName,
        },
        spec: {
          pvc: {
            accessModes: [PVC_ACCESSMODE_RWO],
            resources: {
              requests: {
                storage: '10Gi',
              },
            },
          },
          source: {
            http: {
              url: getSetting(IMAGE_URL_KEY),
            },
          },
        },
      };
      addDisk(vm, disk, 1);
      addVolume(vm, volume);

      addDataVolumeTemplate(vm, dataVolumeTemplate);
      break;
    }
    default:
      break;
  }
};

const addDataVolume = (vm, volume, defaultDisk, getSetting) => {
  addDataVolumeTemplate(vm, {
    metadata: {
      name: volume.name,
    },
    spec: {
      pvc: {
        accessModes: [PVC_ACCESSMODE_RWO],
        resources: {
          requests: {
            storage: `${volume.size}Gi`,
          },
        },
        storageClassName: volume.storageClass,
      },
      source: {},
    },
  });

  addVolume(vm, {
    name: volume.name,
    dataVolume: {
      name: volume.name,
    },
  });

  addBootableDisk(
    vm,
    {
      ...defaultDisk,
      name: volume.name,
      volumeName: volume.name,
    },
    volume.isBootable,
    getSetting
  );
};

const addPersistentVolumeClaimVolume = (vm, volume, defaultDisk, getSetting) => {
  const { name } = volume.attachStorage.metadata;

  addVolume(vm, {
    name,
    persistentVolumeClaim: {
      claimName: name,
    },
  });

  addBootableDisk(
    vm,
    {
      ...defaultDisk,
      name,
      volumeName: name,
    },
    volume.isBootable,
    getSetting
  );
};

const getDefaultDisk = (vm, template) => {
  const defaultDiskName = getTemplateAnnotations(template, ANNOTATION_DEFAULT_DISK);
  return getDevice(vm, 'disks', defaultDiskName);
};

const getDefaultInterface = (vm, template) => {
  const defaultInterfaceName = getTemplateAnnotations(template, ANNOTATION_DEFAULT_NETWORK);
  return getDevice(vm, 'interfaces', defaultInterfaceName);
};

const getDevices = vm => {
  const domain = getDomain(vm);
  if (!domain.devices) {
    domain.devices = {};
  }
  return domain.devices;
};

const getDisks = vm => {
  const devices = getDevices(vm);
  if (!devices.disks) {
    devices.disks = [];
  }
  return devices.disks;
};

const getDomain = vm => {
  const spec = getSpec(vm);
  if (!spec.domain) {
    spec.domain = {};
  }
  return spec.domain;
};

const getInterfaces = vm => {
  const devices = getDevices(vm);
  if (!devices.interfaces) {
    devices.interfaces = [];
  }
  return devices.interfaces;
};

const getVolumes = vm => {
  const spec = getSpec(vm);
  if (!spec.volumes) {
    spec.volumes = [];
  }
  return spec.volumes;
};

const getVmSpec = vm => {
  if (!vm.spec) {
    vm.spec = {};
  }
  return vm.spec;
};

const getSpec = vm => {
  if (!vm.spec.template.spec) {
    vm.spec.template.spec = {};
  }
  return vm.spec.template.spec;
};

const getDevice = (vm, deviceType, deviceName) =>
  get(getDevices(vm), deviceType, []).find(device => device.name === deviceName);

const getDataVolumeTemplates = vm => {
  const spec = getVmSpec(vm);
  if (!spec.dataVolumeTemplates) {
    spec.dataVolumeTemplates = [];
  }
  return spec.dataVolumeTemplates;
};

const getNetworks = vm => {
  const spec = getSpec(vm);
  if (!spec.networks) {
    spec.networks = [];
  }
  return spec.networks;
};

const getAnnotations = vm => {
  if (!vm.metadata.annotations) {
    vm.metadata.annotations = {};
  }
  return vm.metadata.annotations;
};

const addBootableDisk = (vm, diskSpec, isBootable, getSetting) => {
  if (isBootable) {
    switch (getSetting(IMAGE_SOURCE_TYPE_KEY)) {
      case PROVISION_SOURCE_PXE:
        diskSpec.bootOrder = 2;
        break;
      case PROVISION_SOURCE_TEMPLATE:
        diskSpec.bootOrder = 1;
        break;
      default:
        break;
    }
  }

  addDisk(vm, diskSpec);
};

const addDisk = (vm, diskSpec) => {
  const disks = getDisks(vm);
  disks.push(diskSpec);
};

const addVolume = (vm, volumeSpec) => {
  const volumes = getVolumes(vm);
  volumes.push(volumeSpec);
};

const addDataVolumeTemplate = (vm, dataVolumeSpec) => {
  const dataVolumes = getDataVolumeTemplates(vm);
  dataVolumes.push(dataVolumeSpec);
};

const addInterface = (vm, interfaceSpec) => {
  const interfaces = getInterfaces(vm);
  interfaces.push(interfaceSpec);
};

const addNetwork = (vm, networkSpec) => {
  const networks = getNetworks(vm);
  networks.push(networkSpec);
};

const addAnnotation = (vm, key, value) => {
  const annotations = getAnnotations(vm);
  annotations[key] = value;
};

const removeDisksAndVolumes = vm => {
  delete vm.spec.template.spec.domain.devices.disks;
  delete vm.spec.template.spec.volumes;
  delete vm.spec.dataVolumeTemplates;
};
