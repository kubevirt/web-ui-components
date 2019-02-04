import { get, cloneDeep } from 'lodash';
import { safeDump } from 'js-yaml';

import { createVm, createVmTemplate } from '../request';
import { ProcessedTemplatesModel, TemplateModel, VirtualMachineModel, PersistentVolumeClaimModel } from '../../models';
import { baseTemplates } from '../mock_templates';
import { userTemplates, urlTemplate } from '../mock_user_templates';
import { persistentVolumeClaims } from '../mock_pvc';
import { rootContainerDisk, rootDataVolumeDisk } from '../../components/Wizard/CreateVmWizard/CreateVmWizard';

import {
  settingsValue,
  getTemplateFlavors,
  getTemplateWorkloadProfiles,
  getTemplateOperatingSystems,
} from '../selectors';

import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  TEMPLATE_PARAM_VM_NAME,
  POD_NETWORK,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_OS_LABEL,
  ANNOTATION_USED_TEMPLATE,
  CLOUDINIT_DISK,
  TEMPLATE_TYPE_VM,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_PARAM_VM_NAME_DESC,
  ANNOTATION_CLONE_REQUEST,
  LABEL_CLONE_APP,
  TEMPLATE_OS_NAME_ANNOTATION,
} from '../../constants';

import {
  NAME_KEY,
  NAMESPACE_KEY,
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
  OPERATING_SYSTEM_KEY,
  WORKLOAD_PROFILE_KEY,
  STORAGE_TYPE_PVC,
  STORAGE_TYPE_DATAVOLUME,
  STORAGE_TYPE_CONTAINER,
  NETWORK_TYPE_MULTUS,
  NETWORK_TYPE_POD,
  DESCRIPTION_KEY,
} from '../../components/Wizard/CreateVmWizard/constants';

const templates = [...baseTemplates, ...userTemplates];

const basicSettingsContainer = {
  [NAME_KEY]: {
    value: 'name',
  },
  [NAMESPACE_KEY]: {
    value: 'default',
  },
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_CONTAINER,
  },
  [CONTAINER_IMAGE_KEY]: {
    value: 'imageURL',
  },
  [FLAVOR_KEY]: {
    value: 'small',
  },
  [OPERATING_SYSTEM_KEY]: {
    value: {
      id: 'rhel7.0',
      name: 'Red Hat Enterprise Linux 7.0',
    },
  },
  [WORKLOAD_PROFILE_KEY]: {
    value: 'generic',
  },
};

const basicSettingsUrl = {
  ...basicSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL,
  },
  [IMAGE_URL_KEY]: {
    value: 'httpURL',
  },
};

const basicSettingsPxe = {
  ...basicSettingsContainer,
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_PXE,
  },
};

const basicSettingsCloudInit = {
  ...basicSettingsContainer,
  [CLOUD_INIT_KEY]: {
    value: true,
  },
  [HOST_NAME_KEY]: {
    value: 'hostname',
  },
  [AUTHKEYS_KEY]: {
    value: 'keys',
  },
};

const basicSettingsCustomFlavor = {
  ...basicSettingsContainer,
  [FLAVOR_KEY]: {
    value: CUSTOM_FLAVOR,
  },
  [CPU_KEY]: {
    value: '1',
  },
  [MEMORY_KEY]: {
    value: '1',
  },
  [START_VM_KEY]: {
    value: true,
  },
};

const basicSettingsUserTemplate = {
  [NAME_KEY]: {
    value: 'name',
  },
  [NAMESPACE_KEY]: {
    value: 'default',
  },
  [PROVISION_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL,
  },
  [USER_TEMPLATE_KEY]: {
    value: urlTemplate.metadata.name,
  },
  [FLAVOR_KEY]: {
    value: getTemplateFlavors([urlTemplate])[0],
  },
  [WORKLOAD_PROFILE_KEY]: {
    value: getTemplateWorkloadProfiles([urlTemplate])[0],
  },
  [OPERATING_SYSTEM_KEY]: {
    value: getTemplateOperatingSystems([urlTemplate])[0],
  },
};

const basicSettingsContainerWindows = {
  ...basicSettingsContainer,
  [FLAVOR_KEY]: {
    value: 'medium',
  },
  [OPERATING_SYSTEM_KEY]: {
    value: {
      id: 'win2k12r2',
      name: 'Microsoft Windows Server 2012 R2',
    },
  },
};

const pvcDisk = {
  id: 1,
  name: persistentVolumeClaims[2].metadata.name,
  storageType: STORAGE_TYPE_PVC,
};

const templateDataVolumeDisk = {
  id: 2,
  templateStorage: {
    dataVolume: urlTemplate.objects[0].spec.dataVolumeTemplates[0],
    disk: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0],
    volume: urlTemplate.objects[0].spec.template.spec.volumes[0],
  },
  name: urlTemplate.objects[0].spec.template.spec.domain.devices.disks[0].name,
  storageType: STORAGE_TYPE_DATAVOLUME,
  isBootable: true,
};

const podNetwork = {
  name: 'podNetworkName',
  network: POD_NETWORK,
  networkType: NETWORK_TYPE_POD,
};

const multusNetwork = {
  name: 'pxeNetworkName',
  network: 'networkConfig',
  isBootable: true,
  networkType: NETWORK_TYPE_MULTUS,
};

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === TEMPLATE_PARAM_VM_NAME);
    template.objects[0].metadata.name = nameParam.value;
    resolve(template);
  });

export const k8sCreate = (model, resource) => {
  if (model === ProcessedTemplatesModel) {
    return processTemplate(resource);
  }
  return new Promise(resolve => resolve(resource));
};

const testStorage = (results, storageIndex, bootOrder, expectedStorageName, expectedStorageType) => {
  const vm = results[results.length - 1];
  expect(vm.spec.template.spec.domain.devices.disks[storageIndex].name).toBe(expectedStorageName);
  expect(vm.spec.template.spec.domain.devices.disks[storageIndex].bootOrder).toBe(
    bootOrder !== -1 ? bootOrder : undefined
  );

  expect(vm.spec.template.spec.volumes[storageIndex].name).toBe(expectedStorageName);

  if (expectedStorageType.type === STORAGE_TYPE_DATAVOLUME) {
    expect(vm.spec.template.spec.volumes[storageIndex].dataVolume.name).toBe(
      `${expectedStorageName}-${vm.metadata.name}`
    );
    expect(vm.spec.template.spec.volumes[storageIndex].containerDisk).toBeUndefined();
    expect(vm.spec.template.spec.volumes[storageIndex].persistentVolumeClaim).toBeUndefined();

    expect(vm.spec.dataVolumeTemplates[expectedStorageType.index].metadata.name).toBe(
      `${expectedStorageName}-${vm.metadata.name}`
    );
  } else if (expectedStorageType.type === STORAGE_TYPE_PVC) {
    expect(vm.spec.template.spec.volumes[storageIndex].dataVolume).toBeUndefined();
    expect(vm.spec.template.spec.volumes[storageIndex].containerDisk).toBeUndefined();
    expect(vm.spec.template.spec.volumes[storageIndex].persistentVolumeClaim.claimName).toBe(
      `${expectedStorageName}-${vm.metadata.name}`
    );
  } else if (expectedStorageType.type === STORAGE_TYPE_CONTAINER) {
    expect(vm.spec.template.spec.volumes[storageIndex].dataVolume).toBeUndefined();
    expect(vm.spec.template.spec.volumes[storageIndex].containerDisk.image).toBe(expectedStorageType.image);
    expect(vm.spec.template.spec.volumes[storageIndex].persistentVolumeClaim).toBeUndefined();
  }
};

const testContainerImage = results => {
  const vm = results[results.length - 1];
  expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe(rootContainerDisk.name);

  expect(vm.spec.template.spec.volumes[0].name).toBe(rootContainerDisk.name);
  expect(vm.spec.template.spec.volumes[0].containerDisk.image).toBe(
    settingsValue(basicSettingsContainer, CONTAINER_IMAGE_KEY)
  );
  return results;
};

const everyDiskHasVolume = results => {
  const vm = results[results.length - 1];
  vm.spec.template.spec.domain.devices.disks.forEach(disk => {
    expect(vm.spec.template.spec.volumes.filter(volume => volume.name === disk.name)).toHaveLength(1);
  });
};

const testPXE = (results, firstBoot = true) => {
  const vm = results[results.length - 1];
  expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(2);
  expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetwork.name);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].bootOrder).toBe(1);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].name).toEqual(multusNetwork.name);
  expect(vm.spec.template.spec.networks).toHaveLength(2);
  expect(vm.spec.template.spec.networks[0].name).toEqual(podNetwork.name);
  expect(vm.spec.template.spec.networks[1].name).toEqual(multusNetwork.name);
  expect(vm.spec.template.spec.networks[1].multus.networkName).toEqual(multusNetwork.network);

  expect(vm.metadata.annotations['cnv.ui.pxeInterface']).toEqual(multusNetwork.name);
  expect(vm.metadata.annotations['cnv.ui.firstBoot']).toEqual(`${firstBoot}`);
  return results;
};

const testMetadata = (results, os, workload, flavor, template) => {
  const vm = results[results.length - 1];
  expect(vm.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/${flavor}`]).toEqual('true');
  expect(vm.metadata.labels[`${TEMPLATE_OS_LABEL}/${os.id}`]).toEqual('true');
  expect(vm.metadata.labels[`${TEMPLATE_WORKLOAD_LABEL}/${workload}`]).toEqual('true');
  expect(vm.metadata.labels[ANNOTATION_USED_TEMPLATE]).toEqual(template);
  expect(vm.metadata.annotations[`${TEMPLATE_OS_NAME_ANNOTATION}/${os.id}`]).toEqual(os.name);
};

const testCloudConfig = (results, cloudInit) => {
  const vm = results[results.length - 1];
  expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.disks[1].name).toBe(CLOUDINIT_DISK);

  expect(vm.spec.template.spec.volumes[1].name).toBe(CLOUDINIT_DISK);
  expect(vm.spec.template.spec.volumes[1].cloudInitNoCloud.userData).toBe(`#cloud-config\n${safeDump(cloudInit)}`);
};

describe('request.js - provision sources', () => {
  it('Container Image', () =>
    createVm(k8sCreate, templates, basicSettingsContainer, [], [rootContainerDisk], persistentVolumeClaims).then(
      testContainerImage
    ));
  it('URL', () =>
    createVm(k8sCreate, templates, basicSettingsUrl, [], [rootDataVolumeDisk], persistentVolumeClaims).then(results => {
      const vm = results[results.length - 1];
      expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));

      expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe(rootDataVolumeDisk.name);

      expect(vm.spec.template.spec.volumes[0].name).toBe(rootDataVolumeDisk.name);
      expect(vm.spec.template.spec.volumes[0].dataVolume.name).toBe(`${rootDataVolumeDisk.name}-${vm.metadata.name}`);

      expect(vm.spec.dataVolumeTemplates[0].metadata.name).toBe(`${rootDataVolumeDisk.name}-${vm.metadata.name}`);
      expect(vm.spec.dataVolumeTemplates[0].spec.source.http.url).toBe(settingsValue(basicSettingsUrl, IMAGE_URL_KEY));
      expect(vm.spec.dataVolumeTemplates[0].spec.pvc.resources.requests.storage).toBe(`${rootDataVolumeDisk.size}Gi`);
      return results;
    }));
  it('PXE', () =>
    createVm(k8sCreate, templates, basicSettingsPxe, [podNetwork, multusNetwork], persistentVolumeClaims).then(
      testPXE
    ));
  it('User Template', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsUserTemplate,
      [],
      [pvcDisk, templateDataVolumeDisk],
      persistentVolumeClaims
    ).then(results => {
      const vm = results[results.length - 1];
      expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(2);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('2G');

      expect(vm.spec.template.spec.volumes).toHaveLength(2);
      expect(vm.spec.template.spec.domain.devices.disks).toHaveLength(2);
      testStorage(results, 0, -1, pvcDisk.name, { type: STORAGE_TYPE_PVC });
      testStorage(results, 1, 1, templateDataVolumeDisk.templateStorage.disk.name, {
        type: STORAGE_TYPE_DATAVOLUME,
        index: 0,
      });
      return results;
    }));
});

describe('request.js - networks', () => {
  it('with non bootable networks', () =>
    createVm(k8sCreate, templates, basicSettingsContainer, [podNetwork], [], persistentVolumeClaims).then(results => {
      const vm = results[results.length - 1];
      expect(vm.metadata.name).toBe(settingsValue(basicSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeUndefined();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].bootOrder).toBeUndefined();
      expect(vm.spec.template.spec.networks).toHaveLength(1);
      expect(vm.spec.template.spec.networks[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.networks[0].pod).toEqual({});

      expect(get(vm.metadata.annotations, 'cnv.ui.pxeInterface')).toBeUndefined();
      expect(get(vm.metadata.annotations, 'cnv.ui.firstBoot')).toBeUndefined();
      return results;
    }));
  it('default network model is used for all networks', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsContainerWindows,
      [podNetwork, multusNetwork],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = results[results.length - 1];
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(2);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].model).toEqual('e1000e');

      expect(vm.spec.template.spec.domain.devices.interfaces[1].name).toEqual(multusNetwork.name);
      expect(vm.spec.template.spec.domain.devices.interfaces[1].model).toEqual('e1000e');

      expect(vm.spec.template.spec.networks).toHaveLength(2);
      expect(vm.spec.template.spec.networks[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.networks[1].name).toEqual(multusNetwork.name);
      return results;
    }));
  it('without network', () =>
    createVm(k8sCreate, templates, basicSettingsCustomFlavor, [], [], persistentVolumeClaims).then(results => {
      const vm = results[results.length - 1];
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
      expect(vm.spec.template.spec.domain.devices.interfaces).toBeUndefined();
      expect(vm.spec.template.spec.networks).toBeUndefined();
      return results;
    }));
  it('with multus network and no pod network', () =>
    createVm(k8sCreate, templates, basicSettingsCustomFlavor, [multusNetwork], [], persistentVolumeClaims).then(
      results => {
        const vm = results[results.length - 1];
        expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
        expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
        expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(multusNetwork.name);
        expect(vm.spec.template.spec.networks).toHaveLength(1);
        expect(vm.spec.template.spec.networks[0].name).toEqual(multusNetwork.name);
        return results;
      }
    ));
  it('PXE with start on creation', () => {
    const vmPXEStart = cloneDeep(basicSettingsPxe);
    vmPXEStart[START_VM_KEY] = {
      value: true,
    };
    const bootablePvcDisk = {
      ...pvcDisk,
      isBootable: true,
    };
    return createVm(
      k8sCreate,
      templates,
      vmPXEStart,
      [podNetwork, multusNetwork],
      [bootablePvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testPXE(results, false);
      testStorage(results, 0, 2, pvcDisk.name, { type: STORAGE_TYPE_PVC });
      return results;
    });
  });
  it('network with mac address', () => {
    const withMac = cloneDeep(multusNetwork);
    withMac.mac = 'FF-FF-FF-FF-FF-FF';
    return createVm(k8sCreate, templates, basicSettingsCustomFlavor, [withMac], [], persistentVolumeClaims).then(
      results => {
        const vm = results[results.length - 1];
        expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
        expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(withMac.name);
        expect(vm.spec.template.spec.domain.devices.interfaces[0].macAddress).toEqual(withMac.mac);
        return results;
      }
    );
  });
});

describe('request.js - cloudInit', () => {
  it('with CloudInit', () => {
    const cloudInit = {
      users: [
        {
          name: 'default',
          'ssh-authorized-keys': basicSettingsCloudInit[AUTHKEYS_KEY].value,
        },
      ],
      hostname: basicSettingsCloudInit[HOST_NAME_KEY].value,
    };
    return createVm(k8sCreate, templates, basicSettingsCloudInit, [], [rootContainerDisk], persistentVolumeClaims).then(
      results => testCloudConfig(results, cloudInit)
    );
  });
  it('with CloudInit - only hostname', () => {
    const onlyHostname = cloneDeep(basicSettingsCloudInit);
    delete onlyHostname[AUTHKEYS_KEY];

    const cloudInit = {
      hostname: onlyHostname[HOST_NAME_KEY].value,
    };
    return createVm(k8sCreate, templates, onlyHostname, [], [rootContainerDisk], persistentVolumeClaims).then(results =>
      testCloudConfig(results, cloudInit)
    );
  });
  it('with CloudInit - only ssh', () => {
    const onlySSH = cloneDeep(basicSettingsCloudInit);
    delete onlySSH[HOST_NAME_KEY];

    const cloudInit = {
      users: [
        {
          name: 'default',
          'ssh-authorized-keys': onlySSH[AUTHKEYS_KEY].value,
        },
      ],
    };
    return createVm(k8sCreate, templates, onlySSH, [], [rootContainerDisk], persistentVolumeClaims).then(results =>
      testCloudConfig(results, cloudInit)
    );
  });
  it('with CloudInit - no config', () => {
    const noConfig = cloneDeep(basicSettingsCloudInit);
    delete noConfig[HOST_NAME_KEY];
    delete noConfig[AUTHKEYS_KEY];
    return createVm(k8sCreate, templates, noConfig, [], [rootContainerDisk], persistentVolumeClaims).then(results =>
      testCloudConfig(results, {})
    );
  });
  it('without CloudInit - disk and volume is not present', () =>
    createVm(k8sCreate, templates, basicSettingsContainer, [], [rootContainerDisk], persistentVolumeClaims).then(
      results => {
        const vm = results[results.length - 1];
        expect(vm.spec.template.spec.domain.devices.disks.some(disk => disk.name === 'cloudinitdisk')).toBeFalsy();
        expect(vm.spec.template.spec.volumes.some(volume => volume.name === 'cloudinitvolume')).toBeFalsy();
        expect(vm.spec.template.spec.volumes.some(volume => volume.hasOwnProperty('cloudInitNoCloud'))).toBeFalsy();
        return results;
      }
    ));
});

describe('request.js - flavors', () => {
  it('with custom flavor', () =>
    createVm(k8sCreate, templates, basicSettingsCustomFlavor, [], persistentVolumeClaims).then(results => {
      const vm = results[results.length - 1];
      expect(vm.metadata.name).toBe(settingsValue(basicSettingsCustomFlavor, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsCustomFlavor, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(1);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('1G');
      return results;
    }));
});

describe('request.js - storages', () => {
  it('every disk has volume', () =>
    createVm(k8sCreate, templates, basicSettingsContainer, [], [rootContainerDisk], persistentVolumeClaims).then(
      results => everyDiskHasVolume(results)
    ));
  it('every disk has volume - cloud init', () =>
    createVm(k8sCreate, templates, basicSettingsCloudInit, [], [rootContainerDisk], persistentVolumeClaims).then(
      results => everyDiskHasVolume(results)
    ));
  it('ContainerImage with attached disks', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsContainer,
      [],
      [rootContainerDisk, pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testContainerImage(results);
      testStorage(results, 1, -1, pvcDisk.name, { type: STORAGE_TYPE_PVC });
      return results;
    }));

  it('url source with attached disks', () =>
    createVm(k8sCreate, templates, basicSettingsUrl, [], [rootDataVolumeDisk, pvcDisk], persistentVolumeClaims).then(
      results => {
        testStorage(results, 1, -1, pvcDisk.name, { type: STORAGE_TYPE_PVC });
        return results;
      }
    ));

  it('user template with attached disks', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsUserTemplate,
      [],
      [pvcDisk, templateDataVolumeDisk],
      persistentVolumeClaims
    ).then(results => {
      testStorage(results, 1, 1, templateDataVolumeDisk.templateStorage.disk.name, {
        type: STORAGE_TYPE_DATAVOLUME,
        index: 0,
      });
      testStorage(results, 0, -1, pvcDisk.name, { type: STORAGE_TYPE_PVC });
      return results;
    }));

  it('from PXE with attached disks', () => {
    const bootablePvcDisk = {
      ...pvcDisk,
      isBootable: true,
    };
    return createVm(
      k8sCreate,
      templates,
      basicSettingsPxe,
      [podNetwork, multusNetwork],
      [bootablePvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testPXE(results);
      testStorage(results, 0, 2, pvcDisk.name, { type: STORAGE_TYPE_PVC });
      return results;
    });
  });
  it('clones attached PVC disks', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsPxe,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      expect(results).toHaveLength(2);
      const pvcResult = results[0];
      expect(pvcResult.kind).toEqual(PersistentVolumeClaimModel.kind);
      expect(pvcResult.metadata.name).toEqual(`${pvcDisk.name}-${basicSettingsPxe[NAME_KEY].value}`);
      expect(pvcResult.metadata.annotations[ANNOTATION_CLONE_REQUEST]).toEqual(
        `${basicSettingsPxe[NAMESPACE_KEY].value}/${pvcDisk.name}`
      );
      expect(pvcResult.metadata.labels.app).toEqual(LABEL_CLONE_APP);
      return results;
    }));
});

describe('request.js - metadata', () => {
  it('adds description to VM ', () => {
    const withDescription = cloneDeep(basicSettingsContainer);
    withDescription[DESCRIPTION_KEY] = {
      value: 'foo description',
    };
    return createVm(k8sCreate, templates, withDescription, [], [rootContainerDisk], persistentVolumeClaims).then(
      results => {
        const vm = results[results.length - 1];
        expect(vm.metadata.annotations.description).toEqual(settingsValue(withDescription, DESCRIPTION_KEY));
        return results;
      }
    );
  });
  it('VM has os/flavor/workload metadata', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsContainer,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testMetadata(
        results,
        basicSettingsContainer[OPERATING_SYSTEM_KEY].value,
        basicSettingsContainer[WORKLOAD_PROFILE_KEY].value,
        basicSettingsContainer[FLAVOR_KEY].value,
        'openshift_rhel-generic'
      );
      return results;
    }));
  it('VM has os/flavor/workload metadata - user template', () =>
    createVm(
      k8sCreate,
      templates,
      basicSettingsUserTemplate,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testMetadata(
        results,
        basicSettingsUserTemplate[OPERATING_SYSTEM_KEY].value,
        basicSettingsUserTemplate[WORKLOAD_PROFILE_KEY].value,
        basicSettingsUserTemplate[FLAVOR_KEY].value,
        `${urlTemplate.metadata.namespace}_${urlTemplate.metadata.name}`
      );
      return results;
    }));
});

describe('request.js - Create Vm Template', () => {
  it('creates VM Template', () =>
    createVmTemplate(k8sCreate, templates, basicSettingsContainer, [], [rootContainerDisk]).then(vmTemplate => {
      expect(vmTemplate.metadata.name).toEqual(settingsValue(basicSettingsContainer, NAME_KEY));
      expect(vmTemplate.metadata.description).toBeUndefined();
      expect(vmTemplate.metadata.namespace).toEqual(settingsValue(basicSettingsContainer, NAMESPACE_KEY));
      expect(vmTemplate.kind).toEqual(TemplateModel.kind);
      expect(vmTemplate.apiVersion).toEqual(`${TemplateModel.apiGroup}/${TemplateModel.apiVersion}`);
      expect(vmTemplate.metadata.labels[TEMPLATE_TYPE_LABEL]).toEqual(TEMPLATE_TYPE_VM);
      expect(
        vmTemplate.metadata.labels[
          `${TEMPLATE_OS_LABEL}/${settingsValue(basicSettingsContainer, OPERATING_SYSTEM_KEY).id}`
        ]
      ).toEqual('true');
      expect(
        vmTemplate.metadata.labels[
          `${TEMPLATE_WORKLOAD_LABEL}/${settingsValue(basicSettingsContainer, WORKLOAD_PROFILE_KEY)}`
        ]
      ).toEqual('true');
      expect(
        vmTemplate.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/${settingsValue(basicSettingsContainer, FLAVOR_KEY)}`]
      ).toEqual('true');

      expect(vmTemplate.objects).toHaveLength(1);
      expect(vmTemplate.objects[0].kind).toEqual(VirtualMachineModel.kind);
      expect(vmTemplate.objects[0].metadata.name).toEqual(`\${${TEMPLATE_PARAM_VM_NAME}}`);

      expect(vmTemplate.parameters).toHaveLength(1);
      expect(vmTemplate.parameters[0]).toEqual({
        name: TEMPLATE_PARAM_VM_NAME,
        description: TEMPLATE_PARAM_VM_NAME_DESC,
      });
      return vmTemplate;
    }));
  it('adds description to VM Template', () => {
    const withDescription = cloneDeep(basicSettingsContainer);
    withDescription[DESCRIPTION_KEY] = {
      value: 'foo description',
    };
    return createVmTemplate(k8sCreate, templates, withDescription, [], [rootContainerDisk]).then(vmTemplate => {
      expect(vmTemplate.metadata.annotations.description).toEqual(settingsValue(withDescription, DESCRIPTION_KEY));
      expect(get(vmTemplate.objects[0].metadata, 'annotations.description')).toBeUndefined();
      return vmTemplate;
    });
  });
  it('PVC storage is not appended with vm name', () =>
    createVmTemplate(k8sCreate, templates, basicSettingsContainer, [], [rootContainerDisk, pvcDisk]).then(
      vmTemplate => {
        expect(vmTemplate.objects[0].spec.template.spec.volumes[1].persistentVolumeClaim.claimName).toEqual(
          pvcDisk.name
        );
        return vmTemplate;
      }
    ));
});
