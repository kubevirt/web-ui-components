import { cloneDeep, get } from 'lodash';

import { getTemplatesWithLabels, getTemplate } from '../utils/templates';
import {
  getCloudInitVolume,
  getName,
  getNamespace,
  getPvcAccessModes,
  getPvcStorageSize,
  getDataVolumeAccessModes,
  getDataVolumeStorageSize,
  getDataVolumeStorageClassName,
  getPvcStorageClassName,
} from '../selectors';

import { VirtualMachineModel, ProcessedTemplatesModel, TemplateModel, DataVolumeModel, SecretModel } from '../models';

import {
  ANNOTATION_DEFAULT_DISK,
  ANNOTATION_DEFAULT_NETWORK,
  TEMPLATE_PARAM_VM_NAME,
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_IMPORT,
  TEMPLATE_TYPE_BASE,
  PROVISION_SOURCE_PXE,
  POD_NETWORK,
  ANNOTATION_FIRST_BOOT,
  ANNOTATION_PXE_INTERFACE,
  TEMPLATE_API_VERSION,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_PARAM_VM_NAME_DESC,
  TEMPLATE_TYPE_VM,
  TEMPLATE_VM_NAME_LABEL,
  TEMPLATE_OS_NAME_ANNOTATION,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '../constants';

import {
  NAMESPACE_KEY,
  DESCRIPTION_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  USER_TEMPLATE_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  CPU_KEY,
  START_VM_KEY,
  CLOUD_INIT_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  HOST_NAME_KEY,
  AUTHKEYS_KEY,
  NAME_KEY,
  OPERATING_SYSTEM_KEY,
  WORKLOAD_PROFILE_KEY,
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_CONTAINER,
  DATA_VOLUME_SOURCE_URL,
  IMAGE_URL_KEY,
  DATA_VOLUME_SOURCE_BLANK,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_URL_KEY,
} from '../components/Wizard/CreateVmWizard/constants';

import {
  getOsLabel,
  getWorkloadLabel,
  getFlavorLabel,
  getTemplateAnnotations,
  settingsValue,
  selectVm,
} from './selectors';
import { CloudInit } from './cloudInit';
import { addTemplateClone } from './clone';
import { generateDiskName } from '../utils';
import {
  getDevices,
  getDevice,
  addAnnotation,
  addContainerVolume,
  addDataVolume,
  addDataVolumeTemplate,
  addDisk,
  addInterface,
  addLabel,
  addNetwork,
  addTemplateLabel,
  getVolumes,
  getDataVolumeTemplates,
  removeInterfacesAndNetworks,
  addVolume,
  removeDisksAndVolumes,
  getDataVolumeTemplateSpec,
  sequentializeBootOrderIndexes,
} from './vmBuilder';

import { getImportProviderSecretObject } from '../components/Wizard/CreateVmWizard/providers/vmwareProviderPod';

export * from './requests/hosts';

const FALLBACK_DISK = {
  disk: {
    bus: 'virtio',
  },
};

const enhancedCreate = (k8sCreate, kind, data, aditionalObjects = [], ...rest) =>
  k8sCreate(kind, data, ...rest).catch(error =>
    // eslint-disable-next-line prefer-promise-reject-errors
    Promise.reject({ error, message: error.message, objects: [data, ...aditionalObjects] })
  );

export const createVmTemplate = async (
  k8sCreate,
  templates,
  basicSettings,
  networks,
  storage,
  persistentVolumeClaims
) => {
  const create = enhancedCreate.bind(undefined, k8sCreate);
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
  const template = getModifiedVmTemplate(
    templates,
    basicSettings,
    getSetting,
    networks,
    storage,
    persistentVolumeClaims
  );
  const vmTemplate = createTemplateObject(
    settingsValue.bind(undefined, basicSettings),
    selectVm(template.objects),
    template
  );

  let bootDataVolume;
  if (settingsValue(basicSettings, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_URL) {
    const bootStorage = storage.find(s => s.isBootable);
    const vm = selectVm(template.objects);

    const bootVolume = getVolumes(vm).find(v => v.name === bootStorage.name);
    const dataVolumeTemplates = getDataVolumeTemplates(vm);
    bootDataVolume = dataVolumeTemplates.find(t => getName(t) === bootVolume.dataVolume.name);

    const newDataVolumeTemplates = dataVolumeTemplates.filter(t => getName(t) !== bootVolume.dataVolume.name);
    vm.spec.dataVolumeTemplates = newDataVolumeTemplates;

    const newDataVolumeName = generateDiskName(settingsValue(basicSettings, NAME_KEY), bootStorage.name);
    bootVolume.dataVolume.name = newDataVolumeName;

    bootDataVolume.metadata.name = newDataVolumeName;
    bootDataVolume.metadata.namespace = settingsValue(basicSettings, NAMESPACE_KEY);
    bootDataVolume.apiVersion = `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`;
    bootDataVolume.kind = DataVolumeModel.kind;
  }

  sequentializeBootOrderIndexes(selectVm(template.objects));

  const templateResult = await create(TemplateModel, vmTemplate);

  const results = [templateResult];
  if (bootDataVolume) {
    bootDataVolume.metadata.ownerReferences = [
      {
        apiVersion: templateResult.apiVersion,
        blockOwnerDeletion: true,
        controller: true,
        kind: templateResult.kind,
        name: getName(templateResult),
        uid: templateResult.metadata.uid,
      },
    ];
    const dvResult = await create(DataVolumeModel, bootDataVolume);
    results.push(dvResult);
  }
  return results;
};

export const createVm = async (k8sCreate, templates, basicSettings, networks, storage, persistentVolumeClaims) => {
  const create = enhancedCreate.bind(undefined, k8sCreate);
  const getSetting = settingsValue.bind(undefined, basicSettings);
  const template = getModifiedVmTemplate(
    templates,
    basicSettings,
    getSetting,
    networks,
    storage,
    persistentVolumeClaims
  );

  // ProcessedTemplates endpoint will reject the request if user cannot post to the namespace
  // common-templates are stored in openshift namespace, default user can read but cannot post
  const postTemplate = cloneDeep(template);
  postTemplate.metadata.namespace = settingsValue(basicSettings, NAMESPACE_KEY);

  const processedTemplate = await create(ProcessedTemplatesModel, postTemplate);

  const vm = selectVm(processedTemplate.objects);

  sequentializeBootOrderIndexes(vm);

  addMetadata(vm, template, getSetting);

  const namespace = getSetting(NAMESPACE_KEY);
  if (namespace) {
    vm.metadata.namespace = namespace;
  }

  const results = [];

  const importProviderSecret = getImportProviderSecret(getSetting);
  if (importProviderSecret) {
    results.push(await k8sCreate(SecretModel, importProviderSecret));
  }

  results.push(await k8sCreate(VirtualMachineModel, vm));
  return results;
};

const getImportProviderSecret = getSetting => {
  if (
    getSetting(PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY) &&
    getSetting(PROVIDER_VMWARE_VCENTER_KEY) &&
    getSetting(PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT
  ) {
    const url = getSetting(PROVIDER_VMWARE_URL_KEY);
    const username = getSetting(PROVIDER_VMWARE_USER_NAME_KEY);
    const password = get(getSetting(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), PROVIDER_VMWARE_USER_PWD_KEY);
    const namespace = getSetting(NAMESPACE_KEY);

    return getImportProviderSecretObject({ url, username, password, namespace });
  }

  return null;
};

const getModifiedVmTemplate = (templates, basicSettings, getSetting, networks, storage, persistentVolumeClaims) => {
  const template = resolveTemplate(templates, basicSettings, getSetting);

  const vm = selectVm(template.objects);
  modifyVmObject(vm, template, getSetting, networks, storage, persistentVolumeClaims);

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
  addLabel(vm, `${TEMPLATE_OS_LABEL}/${os.id}`, 'true');

  const workload = getSetting(WORKLOAD_PROFILE_KEY);
  addLabel(vm, `${TEMPLATE_WORKLOAD_LABEL}/${workload}`, 'true');

  addLabel(vm, LABEL_USED_TEMPLATE_NAME, getName(template));
  addLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE, getNamespace(template));
  addTemplateLabel(vm, TEMPLATE_VM_NAME_LABEL, vm.metadata.name); // for pairing service-vm (like for RDP)

  addAnnotation(vm, `${TEMPLATE_OS_NAME_ANNOTATION}/${os.id}`, os.name);
};

const modifyVmObject = (vm, template, getSetting, networks, storages, persistentVolumeClaims) => {
  setFlavor(vm, getSetting);
  addNetworks(vm, template, getSetting, networks);

  vm.spec.running = getSetting(START_VM_KEY, false);

  const description = getSetting(DESCRIPTION_KEY);
  if (description) {
    addAnnotation(vm, 'description', description);
  }
  addStorages(vm, template, storages, getSetting, persistentVolumeClaims);
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

const addCloudInit = (vm, defaultDisk, getSetting) => {
  if (getSetting(CLOUD_INIT_KEY)) {
    const existingCloudInitVolume = getCloudInitVolume(vm);
    const cloudInit = new CloudInit({
      volume: existingCloudInitVolume,
    });

    if (getSetting(USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY)) {
      cloudInit.setUserData(getSetting(CLOUD_INIT_CUSTOM_SCRIPT_KEY));
    } else {
      cloudInit.setPredefinedUserData({
        hostname: getSetting(HOST_NAME_KEY),
        sshAuthorizedKeys: getSetting(AUTHKEYS_KEY),
      });
    }

    const { volume, disk } = cloudInit.build();
    if (volume !== existingCloudInitVolume) {
      addDisk(vm, defaultDisk, disk, getSetting);
      addVolume(vm, volume);
    }
  }
};

const addStorages = (vm, template, storages, getSetting, persistentVolumeClaims) => {
  const defaultDisk = getDefaultDisk(vm, template);
  removeDisksAndVolumes(vm);

  if (storages) {
    storages.forEach(storage => {
      switch (storage.storageType) {
        case STORAGE_TYPE_PVC:
          addPvcVolume(vm, storage, getSetting, persistentVolumeClaims);
          break;
        case STORAGE_TYPE_DATAVOLUME:
          addDataVolumeVolume(vm, storage, getSetting);
          break;
        case STORAGE_TYPE_CONTAINER:
          addContainerVolume(vm, storage, getSetting);
          break;
        default:
          if (storage.templateStorage) {
            addVolume(vm, storage.templateStorage.volume);
          }
      }
      addDisk(vm, defaultDisk, storage, getSetting);
    });
  }
  addCloudInit(vm, defaultDisk, getSetting);
};

const addPvcVolume = (vm, storage, getSetting, persistentVolumeClaims) => {
  const pvc = persistentVolumeClaims.find(
    p => getName(p) === storage.name && getNamespace(p) === getSetting(NAMESPACE_KEY)
  );
  const dvTemplate = addTemplateClone(
    vm,
    storage.name,
    getSetting(NAMESPACE_KEY),
    getPvcAccessModes(pvc),
    getPvcStorageSize(pvc),
    getPvcStorageClassName(pvc),
    getSetting(NAME_KEY)
  );
  addDataVolume(vm, {
    name: storage.name,
    dvName: getName(dvTemplate),
  });
};

const addDataVolumeVolume = (vm, storage, getSetting) => {
  const dvStorage = {
    ...storage,
  };
  if (dvStorage.templateStorage) {
    if (dvStorage.templateStorage.dataVolume) {
      const { dataVolume } = dvStorage.templateStorage;
      const dataVolumeTemplate = addTemplateClone(
        vm,
        getName(dataVolume),
        getNamespace(dataVolume),
        getDataVolumeAccessModes(dataVolume),
        getDataVolumeStorageSize(dataVolume), // TODO should take storage specified by user on storage page
        getDataVolumeStorageClassName(dataVolume),
        getSetting(NAME_KEY)
      );
      dvStorage.dvName = getName(dataVolumeTemplate);
    } else if (dvStorage.templateStorage.dataVolumeTemplate) {
      const { dataVolumeTemplate } = dvStorage.templateStorage;
      dataVolumeTemplate.metadata.name = generateDiskName(getSetting(NAME_KEY), storage.name, false);
      addDataVolumeTemplate(vm, dataVolumeTemplate);
      dvStorage.dvName = dataVolumeTemplate.metadata.name;
    }
  } else {
    const source =
      getSetting(PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_URL && storage.isBootable
        ? {
            type: DATA_VOLUME_SOURCE_URL,
            url: getSetting(IMAGE_URL_KEY),
          }
        : {
            type: DATA_VOLUME_SOURCE_BLANK,
          };

    dvStorage.dvName = generateDiskName(getSetting(NAME_KEY), storage.name);
    const dataVolumeSpec = getDataVolumeTemplateSpec(dvStorage, source);
    addDataVolumeTemplate(vm, dataVolumeSpec);
  }
  addDataVolume(vm, dvStorage);
};

const getDefaultDisk = (vm, template) => {
  const defaultDiskName = getTemplateAnnotations(template, ANNOTATION_DEFAULT_DISK);
  return getDevice(vm, 'disks', defaultDiskName) || FALLBACK_DISK;
};

const getDefaultInterface = (vm, template) => {
  const defaultInterfaceName = getTemplateAnnotations(template, ANNOTATION_DEFAULT_NETWORK);
  return getDevice(vm, 'interfaces', defaultInterfaceName);
};
