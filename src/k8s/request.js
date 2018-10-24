import { cloneDeep, get, remove } from 'lodash';
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
  CLOUDINIT_NOCLOUD
} from '../constants';
import { VirtualMachineModel, ProcessedTemplatesModel, PersistentVolumeClaimModel } from '../models';
import { getTemplatesWithLabels, getTemplate } from '../utils/templates';
import { getOsLabel, getWorkloadLabel, getFlavorLabel } from './selectors';

export const createVM = (k8sCreate, templates, basicSettings, networks) => {
  const availableTemplates = [];
  if (get(basicSettings, 'imageSourceType.value') === PROVISION_SOURCE_TEMPLATE) {
    const userTemplate = templates.find(template => template.metadata.name === basicSettings.userTemplate.value);
    availableTemplates.push(userTemplate);
  } else {
    const baseTemplates = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(basicSettings),
      getWorkloadLabel(basicSettings),
      getFlavorLabel(basicSettings)
    ]);
    availableTemplates.push(...baseTemplates);
  }

  basicSettings.chosenTemplate = availableTemplates.length > 0 ? cloneDeep(availableTemplates[0]) : null;

  setParameterValue(basicSettings.chosenTemplate, TEMPLATE_PARAM_VM_NAME, basicSettings.name.value);

  // no more required parameters
  basicSettings.chosenTemplate.parameters.forEach(param => {
    if (param.name !== TEMPLATE_PARAM_VM_NAME && param.required) {
      delete param.required;
    }
  });

  // processedtemplate endpoint is namespaced
  basicSettings.chosenTemplate.metadata.namespace = basicSettings.namespace.value;

  // make sure api version is correct
  basicSettings.chosenTemplate.apiVersion = TEMPLATE_API_VERSION;

  return k8sCreate(ProcessedTemplatesModel, basicSettings.chosenTemplate).then(response => {
    const vm = response.objects.find(obj => obj.kind === VirtualMachineModel.kind);
    modifyVmObject(vm, basicSettings, networks.networks);

    if (basicSettings.imageSourceType.value === PROVISION_SOURCE_TEMPLATE) {
      const pvc = response.objects.find(obj => obj.kind === PersistentVolumeClaimModel.kind);
      if (pvc) {
        pvc.metadata.namespace = basicSettings.namespace.value;
        k8sCreate(PersistentVolumeClaimModel, pvc);
      }
    }
    return k8sCreate(VirtualMachineModel, vm);
  });
};

const setFlavor = (vm, basicSettings) => {
  if (
    get(basicSettings, 'flavor.value') === CUSTOM_FLAVOR ||
    basicSettings.imageSourceType.value === PROVISION_SOURCE_TEMPLATE
  ) {
    vm.spec.template.spec.domain.cpu.cores = parseInt(basicSettings.cpu.value, 10);
    vm.spec.template.spec.domain.resources.requests.memory = `${basicSettings.memory.value}G`;
  }
};

const setParameterValue = (template, paramName, paramValue) => {
  const parameter = template.parameters.find(param => param.name === paramName);
  parameter.value = paramValue;
};

const modifyVmObject = (vm, basicSettings, networks) => {
  setFlavor(vm, basicSettings);
  setSourceType(vm, basicSettings);
  setNetworks(vm, basicSettings, networks);

  // add running status
  vm.spec.running = basicSettings.startVM ? basicSettings.startVM.value : false;

  // add namespace
  if (basicSettings.namespace) {
    vm.metadata.namespace = basicSettings.namespace.value;
  }

  // add description
  if (basicSettings.description) {
    addAnnotation(vm, 'description', basicSettings.description.value);
  }

  addCloudInit(vm, basicSettings);
};

const setSourceType = (vm, basicSettings) => {
  if (
    basicSettings.imageSourceType.value === PROVISION_SOURCE_TEMPLATE ||
    basicSettings.imageSourceType.value === PROVISION_SOURCE_PXE
  ) {
    return;
  }
  const defaultDisk = getDefaultDisk(vm, basicSettings);

  remove(getVolumes(vm), volume => defaultDisk && volume.name === defaultDisk.volumeName);

  switch (get(basicSettings.imageSourceType, 'value')) {
    case PROVISION_SOURCE_REGISTRY: {
      const volume = {
        name: defaultDisk && defaultDisk.volumeName,
        registryDisk: {
          image: basicSettings.registryImage.value
        }
      };
      addVolume(vm, volume);
      break;
    }
    case PROVISION_SOURCE_URL: {
      const dataVolumeName = `datavolume-${basicSettings.name.value}`;
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
            accessModes: [PVC_ACCESSMODE_RWO],
            resources: {
              requests: {
                storage: '2Gi'
              }
            }
          },
          source: {
            http: {
              url: basicSettings.imageURL.value
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

const setNetworks = (vm, basicSettings, networks) => {
  const defaultInterface = getDefaultInterface(vm, basicSettings);
  const interfaceModel = defaultInterface ? defaultInterface.model : undefined;

  if (basicSettings.imageSourceType.value !== PROVISION_SOURCE_TEMPLATE) {
    delete vm.spec.template.spec.domain.devices.interfaces;
    delete vm.spec.template.spec.networks;
  }

  if (!networks.find(network => network.network === POD_NETWORK)) {
    getDevices(vm).autoattachPodInterface = false;
  }

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
    if (interfaceModel) {
      nic.model = interfaceModel;
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

  if (basicSettings.imageSourceType.value === PROVISION_SOURCE_PXE) {
    delete vm.spec.template.spec.domain.devices.disks;
    delete vm.spec.template.spec.volumes;
    addAnnotation(vm, ANNOTATION_PXE_INTERFACE, networks.find(network => network.isBootable).name);
    addAnnotation(vm, ANNOTATION_FIRST_BOOT, 'true');
  }
};

const addCloudInit = (vm, basicSettings) => {
  // remove existing config
  const volumes = get(getSpec(vm), 'volumes', []);
  const existingVolume = volumes.find(volume => volume.hasOwnProperty(CLOUDINIT_NOCLOUD));
  if (existingVolume) {
    remove(getDisks(vm), disk => disk.volumeName === existingVolume.name);
    remove(volumes, volume => volume.name === existingVolume.name);
  }

  if (get(basicSettings.cloudInit, 'value', false)) {
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
          'ssh-authorized-keys': basicSettings.authKeys.value
        }
      ],
      hostname: basicSettings.hostname.value
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

const getDefaultDisk = (vm, basicSettings) => {
  const defaultDiskName = get(basicSettings.chosenTemplate.metadata.annotations, [ANNOTATION_DEFAULT_DISK]);
  return getDevice(vm, 'disks', defaultDiskName);
};

const getDefaultInterface = (vm, basicSettings) => {
  const defaultInterfaceName = get(basicSettings.chosenTemplate.metadata.annotations, [ANNOTATION_DEFAULT_NETWORK]);
  return getDevice(vm, 'interfaces', defaultInterfaceName);
};

const getDevice = (vm, deviceType, deviceName) =>
  get(getDevices(vm), deviceType, []).find(device => device.name === deviceName);

const getSpec = vm => {
  if (!vm.spec.template.spec) {
    vm.spec.template.spec = {};
  }
  return vm.spec.template.spec;
};

const getDomain = vm => {
  const spec = getSpec(vm);
  if (!spec.domain) {
    spec.domain = {};
  }
  return spec.domain;
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
