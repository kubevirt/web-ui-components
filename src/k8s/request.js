import { cloneDeep } from 'lodash';

import { getTemplate, getTemplatesWithLabels } from '../utils/templates';
import {
  getCloudInitVolume,
  getDataVolumeAccessModes,
  getDataVolumeStorageClassName,
  getDataVolumeStorageSize,
  getName,
  getNamespace,
  getPvcAccessModes,
  getPvcStorageClassName,
  getPvcStorageSize,
  getDefaultSCVolumeMode,
  getDefaultSCAccessMode,
  getPvcVolumeMode,
  getDataVolumeMode,
} from '../selectors';

import { DataVolumeModel, PodModel, ProcessedTemplatesModel, TemplateModel, VirtualMachineModel } from '../models';

import {
  ANNOTATION_DEFAULT_DISK,
  ANNOTATION_DEFAULT_NETWORK,
  ANNOTATION_FIRST_BOOT,
  ANNOTATION_PXE_INTERFACE,
  CUSTOM_FLAVOR,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  POD_NETWORK,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
  TEMPLATE_API_VERSION,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_OS_NAME_ANNOTATION,
  TEMPLATE_PARAM_VM_NAME,
  TEMPLATE_PARAM_VM_NAME_DESC,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
  TEMPLATE_VM_NAME_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
} from '../constants';

import {
  AUTHKEYS_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USE_CLOUD_INIT_KEY,
  CPU_KEY,
  DATA_VOLUME_SOURCE_BLANK,
  DATA_VOLUME_SOURCE_URL,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  HOST_NAME_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  OPERATING_SYSTEM_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  START_VM_KEY,
  STORAGE_TYPE_CONTAINER,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_PVC,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USER_TEMPLATE_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../components/Wizard/CreateVmWizard/constants';

import {
  getFlavorLabel,
  getOsLabel,
  getTemplateAnnotations,
  getWorkloadLabel,
  selectVm,
  settingsValue,
} from './selectors';
import { CloudInit } from './cloudInit';
import { addTemplateClone } from './clone';
import { generateDiskName } from '../utils';
import {
  addAnnotation,
  addContainerVolume,
  addDataVolume,
  addDataVolumeTemplate,
  addDisk,
  addExternalImportPvcVolume,
  addInterface,
  addLabel,
  addNetwork,
  addTemplateLabel,
  addVolume,
  getDataVolumeTemplates,
  getDataVolumeTemplateSpec,
  getDevice,
  getDevices,
  getVolumes,
  removeDisksAndVolumes,
  removeInterfacesAndNetworks,
  sequentializeBootOrderIndexes,
} from './vmBuilder';

import { importVmwareVm } from './requests/v2v';
import { buildAddOwnerReferencesPatch, buildOwnerReference } from './util/utils';
import { isVmwareProvider } from '../components/Wizard/CreateVmWizard/providers/VMwareImportProvider/selectors';

export * from './requests/hosts';

const FALLBACK_DISK = {
  disk: {
    bus: 'virtio',
  },
};

export const createVmTemplate = async (
  { k8sCreate, getActualState },
  templates,
  vmSettings,
  networks,
  storage,
  persistentVolumeClaims,
  storageClassConfigMap
) => {
  const getSetting = param => {
    switch (param) {
      case NAME_KEY:
        return `\${${TEMPLATE_PARAM_VM_NAME}}`;
      case DESCRIPTION_KEY:
        return undefined;
      default:
        return settingsValue(vmSettings, param);
    }
  };
  const template = getModifiedVmTemplate(
    templates,
    vmSettings,
    getSetting,
    networks,
    storage,
    persistentVolumeClaims,
    storageClassConfigMap
  );
  const vmTemplate = createTemplateObject(
    settingsValue.bind(undefined, vmSettings),
    selectVm(template.objects),
    template
  );

  let bootDataVolume;
  if (settingsValue(vmSettings, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_URL) {
    const bootStorage = storage.find(s => s.isBootable);
    const vm = selectVm(template.objects);

    const bootVolume = getVolumes(vm).find(v => v.name === bootStorage.name);
    const dataVolumeTemplates = getDataVolumeTemplates(vm);
    bootDataVolume = dataVolumeTemplates.find(t => getName(t) === bootVolume.dataVolume.name);

    const newDataVolumeTemplates = dataVolumeTemplates.filter(t => getName(t) !== bootVolume.dataVolume.name);
    vm.spec.dataVolumeTemplates = newDataVolumeTemplates;

    const newDataVolumeName = generateDiskName(settingsValue(vmSettings, NAME_KEY), bootStorage.name);
    bootVolume.dataVolume.name = newDataVolumeName;

    bootDataVolume.metadata.name = newDataVolumeName;
    bootDataVolume.metadata.namespace = settingsValue(vmSettings, NAMESPACE_KEY);
    bootDataVolume.apiVersion = `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`;
    bootDataVolume.kind = DataVolumeModel.kind;
  }

  sequentializeBootOrderIndexes(selectVm(template.objects));

  const templateResult = await k8sCreate(TemplateModel, vmTemplate);

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
    await k8sCreate(DataVolumeModel, bootDataVolume);
  }

  return getActualState && getActualState();
};

export const createVm = async (
  { k8sGet, k8sCreate, k8sPatch, getActualState },
  templates,
  vmSettings,
  networks,
  storages,
  persistentVolumeClaims,
  storageClassConfigMap,
  units
) => {
  const getSetting = settingsValue.bind(undefined, vmSettings);

  let conversionPod;

  if (isVmwareProvider(vmSettings)) {
    const importResult = await importVmwareVm(
      vmSettings,
      networks,
      storages,
      {
        k8sGet,
        k8sCreate,
        k8sPatch,
      },
      {
        units,
      }
    );
    // eslint-disable-next-line prefer-destructuring
    conversionPod = importResult.conversionPod;
    storages = importResult.mappedStorages;
  }

  const template = getModifiedVmTemplate(
    templates,
    vmSettings,
    getSetting,
    networks,
    storages,
    persistentVolumeClaims,
    storageClassConfigMap
  );

  // ProcessedTemplates endpoint will reject the request if user cannot post to the namespace
  // common-templates are stored in openshift namespace, default user can read but cannot post
  const postTemplate = cloneDeep(template);
  postTemplate.metadata.namespace = settingsValue(vmSettings, NAMESPACE_KEY);

  const processedTemplate = await k8sCreate(ProcessedTemplatesModel, postTemplate, null, { disableHistory: true }); // temporary

  const vm = selectVm(processedTemplate.objects);

  sequentializeBootOrderIndexes(vm);

  addMetadata(vm, template, getSetting);

  const namespace = getSetting(NAMESPACE_KEY);
  if (namespace) {
    vm.metadata.namespace = namespace;
  }

  const virtualMachine = await k8sCreate(VirtualMachineModel, vm);

  if (conversionPod) {
    const patches = [buildAddOwnerReferencesPatch(conversionPod, [buildOwnerReference(virtualMachine)])];
    await k8sPatch(PodModel, conversionPod, patches);
  }

  return getActualState && getActualState();
};

const getModifiedVmTemplate = (
  templates,
  vmSettings,
  getSetting,
  networks,
  storage,
  persistentVolumeClaims,
  storageClassConfigMap
) => {
  const template = resolveTemplate(templates, vmSettings, getSetting);

  const vm = selectVm(template.objects);
  modifyVmObject(vm, template, getSetting, networks, storage, persistentVolumeClaims, storageClassConfigMap);

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

const resolveTemplate = (templates, vmSettings, getSetting) => {
  let chosenTemplate;

  if (getSetting(USER_TEMPLATE_KEY)) {
    chosenTemplate = templates.find(template => template.metadata.name === getSetting(USER_TEMPLATE_KEY));
    if (!chosenTemplate) {
      return null;
    }
    chosenTemplate = cloneDeep(chosenTemplate);
  } else {
    const baseTemplates = getTemplatesWithLabels(getTemplate(templates, TEMPLATE_TYPE_BASE), [
      getOsLabel(settingsValue(vmSettings, OPERATING_SYSTEM_KEY)),
      getWorkloadLabel(settingsValue(vmSettings, WORKLOAD_PROFILE_KEY)),
      getFlavorLabel(settingsValue(vmSettings, FLAVOR_KEY)),
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

const modifyVmObject = (
  vm,
  template,
  getSetting,
  networks,
  storages,
  persistentVolumeClaims,
  storageClassConfigMap
) => {
  setFlavor(vm, getSetting);
  addNetworks(vm, template, getSetting, networks);

  vm.spec.running = getSetting(START_VM_KEY, false);

  const description = getSetting(DESCRIPTION_KEY);
  if (description) {
    addAnnotation(vm, 'description', description);
  }
  addStorages(vm, template, storages, getSetting, persistentVolumeClaims, storageClassConfigMap);
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
  vm.spec.template.spec.hostname = getSetting(HOST_NAME_KEY) || getSetting(NAME_KEY);
  if (!getSetting(USE_CLOUD_INIT_KEY)) {
    return;
  }

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
};

const addStorages = (vm, template, storages, getSetting, persistentVolumeClaims, storageClassConfigMap) => {
  const defaultDisk = getDefaultDisk(vm, template);
  removeDisksAndVolumes(vm);

  if (storages) {
    storages
      .filter(storage => STORAGE_TYPE_EXTERNAL_V2V_TEMP !== storage.storageType)
      .forEach(storage => {
        switch (storage.storageType) {
          case STORAGE_TYPE_PVC:
            addPvcVolume(vm, storage, getSetting, persistentVolumeClaims);
            break;
          case STORAGE_TYPE_DATAVOLUME:
            addDataVolumeVolume(vm, storage, getSetting, storageClassConfigMap);
            break;
          case STORAGE_TYPE_CONTAINER:
            addContainerVolume(vm, storage, getSetting);
            break;
          case STORAGE_TYPE_EXTERNAL_IMPORT:
            addExternalImportPvcVolume(vm, storage);
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
    getPvcVolumeMode(pvc),
    getPvcStorageSize(pvc),
    getPvcStorageClassName(pvc), // storageClass, accessMode and volumeMode stay the same
    getSetting(NAME_KEY)
  );
  addDataVolume(vm, {
    name: storage.name,
    dvName: getName(dvTemplate),
  });
};

const addDataVolumeVolume = (vm, storage, getSetting, storageClassConfigMap) => {
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
        getDataVolumeMode(dataVolume),
        getDataVolumeStorageSize(dataVolume), // TODO should take storage specified by user on storage page
        getDataVolumeStorageClassName(dataVolume), // storageClass stays the same as for the template
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
    dvStorage.accessModes = [getDefaultSCAccessMode(storageClassConfigMap, dvStorage.storageClass)];
    dvStorage.volumeMode = getDefaultSCVolumeMode(storageClassConfigMap, dvStorage.storageClass);
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
