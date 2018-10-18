import { cloneDeep, get, partition, remove } from 'lodash';
import { safeDump } from 'js-yaml';
import {
  CLOUDINIT_DISK,
  CLOUDINIT_VOLUME,
  VIRTIO_BUS,
  ANNOTATION_DEFAULT_DISK,
  PARAM_VM_NAME,
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_TEMPLATE,
  TEMPLATE_TYPE_BASE,
  PROVISION_SOURCE_PXE,
  POD_NETWORK
} from '../constants';
import {
  NAME_KEY,
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
  AUTHKEYS_KEY
} from '../components/Wizard/CreateVmWizard/constants';
import { VirtualMachineModel, ProcessedTemplatesModel, PersistentVolumeClaimModel } from '../models';
import { getTemplatesWithLabels } from '../utils/template';
import {
  getOsLabel,
  getWorkloadLabel,
  getFlavorLabel,
  getTemplate,
  getTemplateAnnotations,
  settingsValue,
  selectPVCs,
  selectAllExceptPVCs,
  selectVm
} from './selectors';

export const createVM = (k8sCreate, templates, basicSettings, { networks }, storage) => {
  const getSetting = settingsValue.bind(undefined, basicSettings);
  const [templateStorage, additionalStorage] = partition(storage, disk => disk.templateStorage);

  const template = resolveTemplate(templates, basicSettings, getSetting, networks, templateStorage);

  return k8sCreate(ProcessedTemplatesModel, template).then(({ objects }) => {
    const vm = selectVm(objects);
    modifyVmObject(vm, template, getSetting, networks, additionalStorage);

    if (getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE) {
      selectPVCs(objects).forEach(pvc => {
        pvc.metadata.namespace = getSetting(NAMESPACE_KEY);
        k8sCreate(PersistentVolumeClaimModel, pvc);
      });
    }
    return k8sCreate(VirtualMachineModel, vm);
  });
};

const resolveTemplate = (templates, basicSettings, getSetting, networks, storage) => {
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
    const newObjects = selectAllExceptPVCs(chosenTemplate.objects);

    // add the ones selected by the user again
    storage.filter(disk => disk.templateStorage).forEach(({ templateStorage: { pvc, disk, volume }, isBootable }) => {
      newObjects.push(pvc);
      addVolume(vm, volume);
      addBootableDisk(vm, networks, disk, isBootable);
    });

    chosenTemplate.objects = newObjects;
  } else {
    const baseTemplates = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(basicSettings),
      getWorkloadLabel(basicSettings),
      getFlavorLabel(basicSettings)
    ]);
    if (baseTemplates.length === 0) {
      return null;
    }
    chosenTemplate = cloneDeep(baseTemplates[0]);
  }

  setParameterValue(chosenTemplate, PARAM_VM_NAME, getSetting(NAME_KEY));

  // no more required parameters
  chosenTemplate.parameters.forEach(param => {
    if (param.name !== PARAM_VM_NAME && param.required) {
      delete param.required;
    }
  });

  // processedtemplate endpoint is namespaced
  chosenTemplate.metadata.namespace = getSetting(NAMESPACE_KEY);

  // make sure api version is correct
  chosenTemplate.apiVersion = 'template.openshift.io/v1';

  return chosenTemplate;
};

const modifyVmObject = (vm, template, getSetting, networks, storages) => {
  setFlavor(vm, getSetting);
  setSourceType(vm, template, getSetting);
  setNetworks(vm, getSetting, networks);

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

  addCloudInit(vm, getSetting);
  addStorages(vm, storages, networks);
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

const setSourceType = (vm, template, getSetting) => {
  const imageSourceType = getSetting(IMAGE_SOURCE_TYPE_KEY);
  if (imageSourceType === PROVISION_SOURCE_TEMPLATE || imageSourceType === PROVISION_SOURCE_PXE) {
    return;
  }

  const defaultDiskName = getTemplateAnnotations(template, ANNOTATION_DEFAULT_DISK);
  const defaultDisk = getDefaultDevice(vm, 'disks', defaultDiskName);

  remove(vm.spec.template.spec.volumes, volume => defaultDisk && volume.name === defaultDisk.volumeName);

  switch (imageSourceType) {
    case PROVISION_SOURCE_REGISTRY: {
      const volume = {
        name: defaultDisk && defaultDisk.volumeName,
        registryDisk: {
          image: getSetting(REGISTRY_IMAGE_KEY)
        }
      };
      addVolume(vm, volume);
      break;
    }
    case PROVISION_SOURCE_URL: {
      const dataVolumeName = `datavolume-${getSetting(NAME_KEY)}`;
      const volume = {
        name: defaultDisk && defaultDisk.volumeName,
        dataVolume: {
          name: dataVolumeName
        }
      };
      const dataVolumeTemplate = {
        metadata: {
          name: dataVolumeName
        },
        spec: {
          pvc: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '2Gi'
              }
            }
          },
          source: {
            http: {
              url: getSetting(IMAGE_URL_KEY)
            }
          }
        }
      };
      addDataVolumeTemplate(vm, dataVolumeTemplate);
      addVolume(vm, volume);
      break;
    }
    default:
      break;
  }
};

const setNetworks = (vm, getSetting, networks) => {
  networks.forEach(network => {
    const nic = {
      bridge: {},
      name: network.name
    };
    if (network.mac) {
      nic.macAddress = network.mac;
    }
    if (network.isBootable) {
      nic.bootOrder = 1;
    }

    const networkConfig = {
      name: network.name
    };
    if (network.network === POD_NETWORK) {
      networkConfig.pod = {};
    } else {
      networkConfig.multus = {
        networkName: network.network
      };
    }
    addInterface(vm, nic);
    addNetwork(vm, networkConfig);
  });

  if (getSetting(IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_PXE) {
    addAnnotation(vm, 'cnv.ui.pxeInterface', networks.find(network => network.isBootable).name);
    addAnnotation(vm, 'cnv.ui.firstBoot', 'true');
  }
};

const getDefaultDevice = (vm, deviceType, deviceName) =>
  get(vm.spec.template.spec.domain.devices, deviceType, []).find(device => device.name === deviceName);

const addCloudInit = (vm, getSetting) => {
  // remove existing config
  const volumes = get(vm.spec.template.spec, 'volumes', []);
  remove(volumes, volume => volume.hasOwnProperty('cloudInitNoCloud'));

  if (getSetting(CLOUD_INIT_KEY)) {
    const cloudInitDisk = {
      name: CLOUDINIT_DISK,
      volumeName: CLOUDINIT_VOLUME,
      disk: {
        bus: VIRTIO_BUS
      }
    };
    addDisk(vm, cloudInitDisk);

    const userDataObject = {
      users: [
        {
          name: 'root',
          'ssh-authorized-keys': getSetting(AUTHKEYS_KEY)
        }
      ],
      hostname: getSetting(HOST_NAME_KEY)
    };

    const userData = safeDump(userDataObject);

    const userDataWithMagicHeader = `#cloud-config\n${userData}`;

    const cloudInitVolume = {
      name: CLOUDINIT_VOLUME,
      cloudInitNoCloud: {
        userData: userDataWithMagicHeader
      }
    };

    addVolume(vm, cloudInitVolume);
  }
};

const addStorages = (vm, storages, networks) => {
  if (storages) {
    for (const storage of storages) {
      if (storage.attachStorage) {
        addPersistentVolumeClaimVolume(vm, networks, storage);
      } else {
        addDataVolume(vm, networks, storage);
      }
    }
  }
};

const addDataVolume = (vm, networks, volume) => {
  addDataVolumeTemplate({
    metadata: {
      name: volume.name
    },
    spec: {
      accessModes: ['ReadWriteOnce'],
      pvc: {
        resources: {
          requests: {
            storage: `${volume.size}Gi`
          }
        },
        storageClassName: volume.storageClass
      },
      source: {}
    },
    status: {}
  });

  addVolume(vm, {
    name: volume.name,
    dataVolume: {
      name: volume.name
    }
  });

  addBootableDisk(
    vm,
    networks,
    {
      name: volume.name,
      volumeName: volume.name,
      disk: {
        bus: VIRTIO_BUS
      }
    },
    volume.isBootable
  );
};

const addPersistentVolumeClaimVolume = (vm, networks, volume) => {
  const { name } = volume.attachStorage.metadata;

  addVolume(vm, {
    name,
    persistentVolumeClaim: {
      claimName: name
    }
  });

  addBootableDisk(
    vm,
    networks,
    {
      name,
      volumeName: name,
      disk: {
        bus: VIRTIO_BUS
      }
    },
    volume.isBootable
  );
};

const addBootableDisk = (vm, networks, diskSpec, isBootable) => {
  let bootOrder;
  if (isBootable) {
    bootOrder = networks.find(network => network.isBootable) ? 2 : 1;
  }

  addDisk(vm, diskSpec, bootOrder);
};

const addDisk = (vm, diskSpec, bootOrder) => {
  const domain = get(vm.spec.template.spec, 'domain', {});
  const devices = get(domain, 'devices', {});
  const disks = get(devices, 'disks', []);

  if (bootOrder) {
    diskSpec.bootOrder = bootOrder;
  }

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

const addDataVolumeTemplate = (vm, dataVolumeSpec) => {
  const dataVolumes = get(vm.spec, 'dataVolumeTemplates', []);
  dataVolumes.push(dataVolumeSpec);
  vm.spec.dataVolumeTemplates = dataVolumes;
};

const addInterface = (vm, interfaceSpec) => {
  const domain = get(vm.spec.template.spec, 'domain', {});
  const devices = get(domain, 'devices', {});
  const interfaces = get(devices, 'interfaces', []);
  interfaces.push(interfaceSpec);
  devices.interfaces = interfaces;
  domain.devices = devices;
  vm.spec.template.spec.domain = domain;
};

const addNetwork = (vm, networkSpec) => {
  const networks = get(vm.spec.template.spec, 'networks', []);
  networks.push(networkSpec);
  vm.spec.template.spec.networks = networks;
};

const addAnnotation = (vm, key, value) => {
  const annotations = get(vm.metadata, 'annotations', {});
  annotations[key] = value;
  vm.metadata.annotations = annotations;
};

const removeDisksAndVolumes = vm => {
  delete vm.spec.template.spec.domain.devices.disks;
  delete vm.spec.template.spec.volumes;
};
