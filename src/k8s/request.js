import { cloneDeep, get } from 'lodash';
import { safeDump } from 'js-yaml';
import {
  CLOUDINIT_DISK,
  ANNOTATION_DEFAULT_DISK,
  ANNOTATION_DEFAULT_NETWORK,
  TEMPLATE_PARAM_VM_NAME,
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_URL,
  TEMPLATE_TYPE_BASE,
  PROVISION_SOURCE_PXE,
  POD_NETWORK,
  ANNOTATION_FIRST_BOOT,
  ANNOTATION_PXE_INTERFACE,
  TEMPLATE_API_VERSION,
  PVC_ACCESSMODE_RWO,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  ANNOTATION_USED_TEMPLATE,
  BOOT_ORDER_FIRST,
  BOOT_ORDER_SECOND,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_PARAM_VM_NAME_DESC,
  TEMPLATE_TYPE_VM,
} from '../constants';
import {
  NAMESPACE_KEY,
  DESCRIPTION_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  CONTAINER_IMAGE_KEY,
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
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_CONTAINER,
  NETWORK_TYPE_MULTUS,
  NETWORK_TYPE_POD,
} from '../components/Wizard/CreateVmWizard/constants';
import { VirtualMachineModel, ProcessedTemplatesModel, TemplateModel } from '../models';
import { getTemplatesWithLabels, getTemplate } from '../utils/templates';
import {
  getOsLabel,
  getWorkloadLabel,
  getFlavorLabel,
  getTemplateAnnotations,
  settingsValue,
  selectVm,
} from './selectors';

export const createVmTemplate = (k8sCreate, templates, basicSettings, networks, storage) => {
  const getSetting = param => {
    switch (param) {
      case NAME_KEY:
        return `\${${TEMPLATE_PARAM_VM_NAME}}`;
      case DESCRIPTION_KEY:
        return undefined;
      default:
        return settingsValue(basicSettings, param);
    }
  };
  const template = getModifiedVmTemplate(templates, basicSettings, getSetting, networks, storage);
  const vmTemplate = createTemplateObject(
    settingsValue.bind(undefined, basicSettings),
    selectVm(template.objects),
    template
  );
  return k8sCreate(TemplateModel, vmTemplate);
};

export const createVm = (k8sCreate, templates, basicSettings, networks, storage) => {
  const getSetting = settingsValue.bind(undefined, basicSettings);
  const template = getModifiedVmTemplate(templates, basicSettings, getSetting, networks, storage);
  return k8sCreate(ProcessedTemplatesModel, template).then(({ objects }) => {
    const vm = selectVm(objects);

    addMetadata(vm, template, getSetting);

    const namespace = getSetting(NAMESPACE_KEY);
    if (namespace) {
      vm.metadata.namespace = namespace;
    }

    return k8sCreate(VirtualMachineModel, vm);
  });
};

const getModifiedVmTemplate = (templates, basicSettings, getSetting, networks, storage) => {
  const template = resolveTemplate(templates, basicSettings, getSetting);

  const vm = selectVm(template.objects);
  modifyVmObject(vm, template, getSetting, networks, storage);

  return template;
};

const createTemplateObject = (getSetting, vm, template) => {
  const vmTemplate = {
    apiVersion: `${TemplateModel.apiGroup}/${TemplateModel.apiVersion}`,
    kind: TemplateModel.kind,
    metadata: {
      name: getSetting(NAME_KEY),
      namespace: getSetting(NAMESPACE_KEY),
    },
    objects: [vm],
    parameters: [
      {
        name: TEMPLATE_PARAM_VM_NAME,
        description: TEMPLATE_PARAM_VM_NAME_DESC,
      },
    ],
  };
  const description = getSetting(DESCRIPTION_KEY);
  if (description) {
    addAnnotation(vmTemplate, 'description', description);
  }
  addMetadata(vmTemplate, template, getSetting);
  addLabel(vmTemplate, [TEMPLATE_TYPE_LABEL], TEMPLATE_TYPE_VM);
  return vmTemplate;
};

const resolveTemplate = (templates, basicSettings, getSetting) => {
  let chosenTemplate;

  if (getSetting(USER_TEMPLATE_KEY)) {
    chosenTemplate = templates.find(template => template.metadata.name === getSetting(USER_TEMPLATE_KEY));
    if (!chosenTemplate) {
      return null;
    }
    chosenTemplate = cloneDeep(chosenTemplate);
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
  const flavor = getSetting(FLAVOR_KEY);
  addLabel(vm, `${TEMPLATE_FLAVOR_LABEL}/${flavor}`, 'true');

  const os = getSetting(OPERATING_SYSTEM_KEY);
  addLabel(vm, `${TEMPLATE_OS_LABEL}/${os}`, 'true');

  const workload = getSetting(WORKLOAD_PROFILE_KEY);
  addLabel(vm, `${TEMPLATE_WORKLOAD_LABEL}/${workload}`, 'true');

  addLabel(vm, ANNOTATION_USED_TEMPLATE, `${template.metadata.namespace}_${template.metadata.name}`);
};

const modifyVmObject = (vm, template, getSetting, networks, storages) => {
  setFlavor(vm, getSetting);
  addNetworks(vm, template, getSetting, networks);

  vm.spec.running = getSetting(START_VM_KEY, false);

  const description = getSetting(DESCRIPTION_KEY);
  if (description) {
    addAnnotation(vm, 'description', description);
  }
  addStorages(vm, template, storages, getSetting);
};

const setFlavor = (vm, getSetting) => {
  if (getSetting(FLAVOR_KEY) === CUSTOM_FLAVOR) {
    vm.spec.template.spec.domain.cpu.cores = parseInt(getSetting(CPU_KEY), 10);
    vm.spec.template.spec.domain.resources.requests.memory = `${getSetting(MEMORY_KEY)}G`;
  }
};

const setParameterValue = (template, paramName, paramValue) => {
  const parameter = template.parameters.find(param => param.name === paramName);
  parameter.value = paramValue;
};

const addNetworks = (vm, template, getSetting, networks) => {
  const defaultInterface = getDefaultInterface(vm, template) || {
    bridge: {},
  };
  removeInterfacesAndNetworks(vm);

  if (!networks.find(network => network.network === POD_NETWORK)) {
    getDevices(vm).autoattachPodInterface = false;
  }

  networks.forEach(network => {
    addInterface(vm, defaultInterface, network);
    addNetwork(vm, network);
  });

  if (getSetting(PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_PXE) {
    addAnnotation(vm, ANNOTATION_PXE_INTERFACE, networks.find(network => network.isBootable).name);
    const startOnCreation = getSetting(START_VM_KEY, false);
    addAnnotation(vm, ANNOTATION_FIRST_BOOT, `${!startOnCreation}`);
  }
};

// TODO what about user-edited cloudinit in template
const addCloudInit = (vm, defaultDisk, getSetting) => {
  if (getSetting(CLOUD_INIT_KEY)) {
    const cloudInitDisk = {
      name: CLOUDINIT_DISK,
    };
    addDisk(vm, defaultDisk, cloudInitDisk, getSetting);

    const userDataObject = {};

    if (getSetting(AUTHKEYS_KEY)) {
      userDataObject.users = [
        {
          name: 'root',
          'ssh-authorized-keys': getSetting(AUTHKEYS_KEY),
        },
      ];
    }

    if (getSetting(HOST_NAME_KEY)) {
      userDataObject.hostname = getSetting(HOST_NAME_KEY);
    }

    const userData = safeDump(userDataObject);

    const userDataWithMagicHeader = `#cloud-config\n${userData}`;

    const cloudInitVolume = {
      name: CLOUDINIT_DISK,
      cloudInitNoCloud: {
        userData: userDataWithMagicHeader,
      },
    };

    addVolume(vm, cloudInitVolume);
  }
};

const addStorages = (vm, template, storages, getSetting) => {
  const defaultDisk = getDefaultDisk(vm, template) || {};
  removeDisksAndVolumes(vm);

  if (storages) {
    storages.forEach(storage => {
      switch (storage.storageType) {
        case STORAGE_TYPE_PVC:
          addPvcVolume(vm, storage);
          break;
        case STORAGE_TYPE_DATAVOLUME:
          addDataVolumeTemplate(vm, storage, getSetting);
          addDataVolume(vm, storage, getSetting);
          break;
        // TODO What about unknown types ( ie from user-edited template ), just add disk & volume copied from template?
        case STORAGE_TYPE_CONTAINER:
        default:
          addContainerVolume(vm, storage, getSetting);
      }
      addDisk(vm, defaultDisk, storage, getSetting);
    });
  }
  addCloudInit(vm, defaultDisk, getSetting);
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

const getLabels = vm => {
  if (!vm.metadata.labels) {
    vm.metadata.labels = {};
  }
  return vm.metadata.labels;
};

const addDisk = (vm, defaultDisk, storage, getSetting) => {
  const diskSpec = {
    ...(storage.templateStorage ? storage.templateStorage.disk : defaultDisk),
    name: storage.name,
    volumeName: storage.name,
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

const addPvcVolume = (vm, storage) => {
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

const addContainerVolume = (vm, storage, getSetting) => {
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

const addDataVolume = (vm, storage, getSetting) => {
  const volume = {
    ...(storage.templateStorage ? storage.templateStorage.volume : {}),
    name: storage.name,
    dataVolume: {
      ...(storage.templateStorage ? storage.templateStorage.volume.dataVolume : {}),
      name: `${storage.name}-${getSetting(NAME_KEY)}`.toLowerCase(),
    },
  };
  addVolume(vm, volume);
};

const addVolume = (vm, volumeSpec) => {
  const volumes = getVolumes(vm);
  volumes.push(volumeSpec);
};

// TODO datavolumetemplate should have unique name bcs its created as object in kubernetes
// TOTO add ie vm name
const addDataVolumeTemplate = (vm, storage, getSetting) => {
  const urlSource = {
    http: {
      url: getSetting(IMAGE_URL_KEY),
    },
  };
  const blankSource = {
    blank: {},
  };
  const source =
    getSetting(PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_URL && storage.isBootable ? urlSource : blankSource;

  const dataVolume = {
    ...(storage.templateStorage ? storage.templateStorage.dataVolume : {}),
    metadata: {
      ...(storage.templateStorage ? storage.templateStorage.dataVolume.metadata : {}),
      name: `${storage.name}-${getSetting(NAME_KEY)}`.toLowerCase(),
    },
    spec: {
      ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec : {}),
      pvc: {
        ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec.pvc : {}),
        accessModes: [
          ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec.pvc.accessModes : [PVC_ACCESSMODE_RWO]),
        ],
        resources: {
          ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec.pvc.resources : {}),
          requests: {
            ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec.pvc.resources.requests : {}),
            storage: `${storage.size}Gi`,
          },
        },
        storageClassName: storage.storageClass,
      },
      source: {
        ...(storage.templateStorage ? storage.templateStorage.dataVolume.spec.source : source),
      },
    },
  };

  const dataVolumes = getDataVolumeTemplates(vm);
  dataVolumes.push(dataVolume);
};

const addInterface = (vm, defaultInterface, network) => {
  const interfaceSpec = {
    ...(network.templateNetwork ? network.templateNetwork.interface : defaultInterface),
    name: network.name,
  };
  if (network.isBootable) {
    interfaceSpec.bootOrder = BOOT_ORDER_FIRST;
  } else {
    delete interfaceSpec.bootOrder;
  }

  const interfaces = getInterfaces(vm);
  interfaces.push(interfaceSpec);
};

const addNetwork = (vm, network) => {
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

const addAnnotation = (vm, key, value) => {
  const annotations = getAnnotations(vm);
  annotations[key] = value;
};

const addLabel = (vm, key, value) => {
  const labels = getLabels(vm);
  labels[key] = value;
};

const removeDisksAndVolumes = vm => {
  delete vm.spec.template.spec.domain.devices.disks;
  delete vm.spec.template.spec.volumes;
  delete vm.spec.dataVolumeTemplates;
};

const removeInterfacesAndNetworks = vm => {
  delete vm.spec.template.spec.domain.devices.interfaces;
  delete vm.spec.template.spec.networks;
};
