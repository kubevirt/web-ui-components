import { cloneDeep, get, remove } from 'lodash';
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
import { VirtualMachineModel, ProcessedTemplatesModel, PersistentVolumeClaimModel } from '../models';
import { getTemplatesWithLabels } from '../utils/template';
import { getOsLabel, getWorkloadLabel, getFlavorLabel, getTemplate } from './selectors';

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

  setParameterValue(basicSettings.chosenTemplate, PARAM_VM_NAME, basicSettings.name.value);

  // no more required parameters
  basicSettings.chosenTemplate.parameters.forEach(param => {
    if (param.name !== PARAM_VM_NAME && param.required) {
      delete param.required;
    }
  });

  // processedtemplate endpoint is namespaced
  basicSettings.chosenTemplate.metadata.namespace = basicSettings.namespace.value;

  // make sure api version is correct
  basicSettings.chosenTemplate.apiVersion = 'template.openshift.io/v1';

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
  const defaultDiskName = get(basicSettings.chosenTemplate.metadata.annotations, [ANNOTATION_DEFAULT_DISK]);
  const defaultDisk = getDefaultDevice(vm, 'disks', defaultDiskName);

  remove(vm.spec.template.spec.volumes, volume => defaultDisk && volume.name === defaultDisk.volumeName);

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
            accessModes: ['ReadWriteOnce'],
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

  if (basicSettings.imageSourceType.value === PROVISION_SOURCE_PXE) {
    delete vm.spec.template.spec.domain.devices.disks;
    delete vm.spec.template.spec.volumes;
    addAnnotation(vm, 'cnv.ui.pxeInterface', networks.find(network => network.isBootable).name);
    addAnnotation(vm, 'cnv.ui.firstBoot', 'true');
  }
};

const getDefaultDevice = (vm, deviceType, deviceName) =>
  get(vm.spec.template.spec.domain.devices, deviceType, []).find(device => device.name === deviceName);

const addCloudInit = (vm, basicSettings) => {
  // remove existing config
  const volumes = get(vm.spec.template.spec, 'volumes', []);
  remove(volumes, volume => volume.hasOwnProperty('cloudInitNoCloud'));

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
