import { get, cloneDeep } from 'lodash';
import { safeDump } from 'js-yaml';

import { createVm, createVmTemplate } from '../request';
import { EnhancedK8sMethods } from '../util/enhancedK8sMethods';
import { TemplateModel, VirtualMachineModel } from '../../models';
import { baseTemplates } from '../objects/template';
import { userTemplates, urlTemplate } from '../../tests/mocks/user_template';
import { persistentVolumeClaims } from '../../tests/mocks/persistentVolumeClaim';
import { pvcDisk, templateDataVolumeDisk } from '../../tests/forms_mocks/disk.mock';
import { podNetwork, multusNetwork } from '../../tests/forms_mocks/nic.mock';
import {
  vmSettingsCloudInit,
  vmSettingsContainer,
  vmSettingsContainerWindows,
  vmSettingsCustomFlavor,
  vmSettingsPxe,
  vmSettingsUrl,
  vmSettingsUserTemplate,
} from '../../tests/forms_mocks/vmSettings.mock';
import {
  rootContainerDisk,
  rootDataVolumeDisk,
} from '../../components/Wizard/CreateVmWizard/stateUpdate/storageTabStateUpdate';
import { k8sCreate } from '../../tests/k8s';

import { settingsValue, selectVm, selectTemplate } from '../selectors';

import {
  TEMPLATE_PARAM_VM_NAME,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_OS_LABEL,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  CLOUDINIT_DISK,
  TEMPLATE_TYPE_VM,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_PARAM_VM_NAME_DESC,
  TEMPLATE_OS_NAME_ANNOTATION,
  ANNOTATION_PXE_INTERFACE,
  ANNOTATION_FIRST_BOOT,
} from '../../constants';

import {
  NAME_KEY,
  NAMESPACE_KEY,
  CONTAINER_IMAGE_KEY,
  IMAGE_URL_KEY,
  FLAVOR_KEY,
  START_VM_KEY,
  HOST_NAME_KEY,
  AUTHKEYS_KEY,
  OPERATING_SYSTEM_KEY,
  WORKLOAD_PROFILE_KEY,
  DESCRIPTION_KEY,
} from '../../components/Wizard/CreateVmWizard/constants';
import { getName, getNamespace } from '../../selectors';
import { generateDiskName } from '../../utils';

const templates = [...baseTemplates, ...userTemplates];

const testPvcStorage = (results, storageIndex, dvIndex, bootOrder, pvcName, pvcNamespace) => {
  const vm = selectVm(results);
  const dvName = generateDiskName(getName(vm), pvcName, true);
  testStorage(vm, storageIndex, bootOrder, pvcName);
  expect(vm.spec.template.spec.volumes[storageIndex].persistentVolumeClaim).toBeUndefined();
  expect(vm.spec.template.spec.volumes[storageIndex].containerDisk).toBeUndefined();
  expect(vm.spec.template.spec.volumes[storageIndex].dataVolume.name).toEqual(dvName);
  expect(vm.spec.dataVolumeTemplates[dvIndex].metadata.name).toEqual(dvName);
  expect(vm.spec.dataVolumeTemplates[dvIndex].spec.source.pvc.name).toEqual(pvcName);
  expect(vm.spec.dataVolumeTemplates[dvIndex].spec.source.pvc.namespace).toEqual(pvcNamespace);
};

const testDataVolumeStorage = (
  results,
  storageIndex,
  bootOrder,
  expectedDiskName,
  originalDvName,
  originalDvNamespace
) => {
  const vm = selectVm(results);
  const dvName = generateDiskName(getName(vm), originalDvName, true);
  testStorage(vm, storageIndex, bootOrder, expectedDiskName);
  expect(vm.spec.template.spec.volumes[storageIndex].dataVolume.name).toBe(dvName);
  expect(vm.spec.template.spec.volumes[storageIndex].containerDisk).toBeUndefined();
  expect(vm.spec.template.spec.volumes[storageIndex].persistentVolumeClaim).toBeUndefined();

  expect(vm.spec.dataVolumeTemplates[storageIndex].metadata.name).toBe(dvName);
  expect(vm.spec.dataVolumeTemplates[storageIndex].spec.source.pvc.name).toEqual(originalDvName);
  expect(vm.spec.dataVolumeTemplates[storageIndex].spec.source.pvc.namespace).toEqual(originalDvNamespace);
};

const testStorage = (vm, storageIndex, bootOrder, expectedName) => {
  expect(vm.spec.template.spec.domain.devices.disks[storageIndex].name).toBe(expectedName);
  expect(vm.spec.template.spec.domain.devices.disks[storageIndex].bootOrder).toEqual(bootOrder);
  expect(vm.spec.template.spec.volumes[storageIndex].name).toBe(expectedName);
};

const testContainerImage = results => {
  const vm = selectVm(results);
  expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe(rootContainerDisk.name);

  expect(vm.spec.template.spec.volumes[0].name).toBe(rootContainerDisk.name);
  expect(vm.spec.template.spec.volumes[0].containerDisk.image).toBe(
    settingsValue(vmSettingsContainer, CONTAINER_IMAGE_KEY)
  );
  return vm;
};

const everyDiskHasVolume = results => {
  const vm = selectVm(results);
  vm.spec.template.spec.domain.devices.disks.forEach(disk => {
    expect(vm.spec.template.spec.volumes.filter(volume => volume.name === disk.name)).toHaveLength(1);
  });
};

const testPXE = (results, firstBoot = true) => {
  const vm = selectVm(results);
  expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(2);
  expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetwork.name);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].bootOrder).toBe(1);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].name).toEqual(multusNetwork.name);
  expect(vm.spec.template.spec.networks).toHaveLength(2);
  expect(vm.spec.template.spec.networks[0].name).toEqual(podNetwork.name);
  expect(vm.spec.template.spec.networks[1].name).toEqual(multusNetwork.name);
  expect(vm.spec.template.spec.networks[1].multus.networkName).toEqual(multusNetwork.network);

  expect(vm.metadata.annotations[ANNOTATION_PXE_INTERFACE]).toEqual(multusNetwork.name);
  expect(vm.metadata.annotations[ANNOTATION_FIRST_BOOT]).toEqual(`${firstBoot}`);
  return vm;
};

const testMetadata = (results, os, workload, flavor, templateName, templateNamespace) => {
  const vm = selectVm(results);
  expect(vm.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/${flavor}`]).toEqual('true');
  expect(vm.metadata.labels[`${TEMPLATE_OS_LABEL}/${os.id}`]).toEqual('true');
  expect(vm.metadata.labels[`${TEMPLATE_WORKLOAD_LABEL}/${workload}`]).toEqual('true');
  expect(vm.metadata.labels[LABEL_USED_TEMPLATE_NAME]).toEqual(templateName);
  expect(vm.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE]).toEqual(templateNamespace);
  expect(vm.metadata.annotations[`${TEMPLATE_OS_NAME_ANNOTATION}/${os.id}`]).toEqual(os.name);
};

const testCloudConfig = (results, cloudInit) => {
  const vm = selectVm(results);
  expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.disks[1].name).toBe(CLOUDINIT_DISK);

  expect(vm.spec.template.spec.volumes[1].name).toBe(CLOUDINIT_DISK);
  expect(vm.spec.template.spec.volumes[1].cloudInitNoCloud.userData).toBe(`#cloud-config\n${safeDump(cloudInit)}`);
};

describe('request.js - provision sources', () => {
  it('Container Image', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(testContainerImage));
  it('URL', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsUrl,
      [],
      [rootDataVolumeDisk],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));

      expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe(rootDataVolumeDisk.name);

      expect(vm.spec.template.spec.volumes[0].name).toBe(rootDataVolumeDisk.name);
      expect(vm.spec.template.spec.volumes[0].dataVolume.name).toBe(
        generateDiskName(getName(vm), rootDataVolumeDisk.name)
      );

      expect(vm.spec.dataVolumeTemplates[0].metadata.name).toBe(generateDiskName(getName(vm), rootDataVolumeDisk.name));
      expect(vm.spec.dataVolumeTemplates[0].spec.source.http.url).toBe(settingsValue(vmSettingsUrl, IMAGE_URL_KEY));
      expect(vm.spec.dataVolumeTemplates[0].spec.pvc.resources.requests.storage).toBe(`${rootDataVolumeDisk.size}Gi`);
      return results;
    }));
  it('PXE', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsPxe,
      [podNetwork, multusNetwork],
      persistentVolumeClaims
    ).then(testPXE));
  it('User Template', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsUserTemplate,
      [],
      [pvcDisk, templateDataVolumeDisk],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(2);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('2G');

      expect(vm.spec.template.spec.volumes).toHaveLength(2);
      expect(vm.spec.template.spec.domain.devices.disks).toHaveLength(2);
      testPvcStorage(results, 0, 0, 2, pvcDisk.name, getNamespace(selectVm(results)));
      testDataVolumeStorage(
        results,
        1,
        1,
        templateDataVolumeDisk.name,
        templateDataVolumeDisk.templateStorage.dataVolume.metadata.name,
        templateDataVolumeDisk.templateStorage.dataVolume.metadata.namespace
      );
      return results;
    }));
});

describe('request.js - networks', () => {
  it('with non bootable networks', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [podNetwork],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.metadata.name).toBe(settingsValue(vmSettingsContainer, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeUndefined();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].bootOrder).toEqual(1);
      expect(vm.spec.template.spec.networks).toHaveLength(1);
      expect(vm.spec.template.spec.networks[0].name).toEqual(podNetwork.name);
      expect(vm.spec.template.spec.networks[0].pod).toEqual({});

      expect(get(vm.metadata.annotations, [ANNOTATION_PXE_INTERFACE])).toBeUndefined();
      expect(get(vm.metadata.annotations, [ANNOTATION_FIRST_BOOT])).toBeUndefined();
      return results;
    }));
  it('default network model is used for all networks', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainerWindows,
      [podNetwork, multusNetwork],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
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
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsCustomFlavor,
      [],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(0);
      expect(vm.spec.template.spec.networks).toBeUndefined();
      return results;
    }));
  it('with multus network and no pod network', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsCustomFlavor,
      [multusNetwork],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(multusNetwork.name);
      expect(vm.spec.template.spec.networks).toHaveLength(1);
      expect(vm.spec.template.spec.networks[0].name).toEqual(multusNetwork.name);
      return results;
    }));
  it('PXE with start on creation', () => {
    const vmPXEStart = cloneDeep(vmSettingsPxe);
    vmPXEStart[START_VM_KEY] = {
      value: true,
    };
    const bootablePvcDisk = {
      ...pvcDisk,
      isBootable: true,
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmPXEStart,
      [podNetwork, multusNetwork],
      [bootablePvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testPXE(results, false);
      testPvcStorage(results, 0, 0, 3, pvcDisk.name, getNamespace(selectVm(results)));
      return results;
    });
  });
  it('network with mac address', () => {
    const withMac = cloneDeep(multusNetwork);
    withMac.mac = 'FF-FF-FF-FF-FF-FF';
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsCustomFlavor,
      [withMac],
      [],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(withMac.name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].macAddress).toEqual(withMac.mac);
      return results;
    });
  });
});

describe('request.js - cloudInit', () => {
  it('with CloudInit', () => {
    const cloudInit = {
      users: [
        {
          name: 'default',
          'ssh-authorized-keys': vmSettingsCloudInit[AUTHKEYS_KEY].value,
        },
      ],
      hostname: vmSettingsCloudInit[HOST_NAME_KEY].value,
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsCloudInit,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => testCloudConfig(results, cloudInit));
  });
  it('with CloudInit - only hostname', () => {
    const onlyHostname = cloneDeep(vmSettingsCloudInit);
    delete onlyHostname[AUTHKEYS_KEY];

    const cloudInit = {
      hostname: onlyHostname[HOST_NAME_KEY].value,
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      onlyHostname,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => testCloudConfig(results, cloudInit));
  });
  it('with CloudInit - only ssh', () => {
    const onlySSH = cloneDeep(vmSettingsCloudInit);
    delete onlySSH[HOST_NAME_KEY];

    const cloudInit = {
      users: [
        {
          name: 'default',
          'ssh-authorized-keys': onlySSH[AUTHKEYS_KEY].value,
        },
      ],
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      onlySSH,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => testCloudConfig(results, cloudInit));
  });
  it('with CloudInit - no config', () => {
    const noConfig = cloneDeep(vmSettingsCloudInit);
    delete noConfig[HOST_NAME_KEY];
    delete noConfig[AUTHKEYS_KEY];
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      noConfig,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => testCloudConfig(results, {}));
  });
  it('without CloudInit - disk and volume is not present', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.spec.template.spec.domain.devices.disks.some(disk => disk.name === 'cloudinitdisk')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.name === 'cloudinitvolume')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.hasOwnProperty('cloudInitNoCloud'))).toBeFalsy();
      return results;
    }));
});

describe('request.js - flavors', () => {
  it('with custom flavor', () =>
    createVm(new EnhancedK8sMethods({ k8sCreate }), templates, vmSettingsCustomFlavor, [], persistentVolumeClaims).then(
      results => {
        const vm = selectVm(results);
        expect(vm.metadata.name).toBe(settingsValue(vmSettingsCustomFlavor, NAME_KEY));
        expect(vm.metadata.namespace).toBe(settingsValue(vmSettingsCustomFlavor, NAMESPACE_KEY));
        expect(vm.spec.template.spec.domain.cpu.cores).toBe(1);
        expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('1G');
        return results;
      }
    ));
});

describe('request.js - storages', () => {
  it('every disk has volume', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => everyDiskHasVolume(results)));
  it('every disk has volume - cloud init', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsCloudInit,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => everyDiskHasVolume(results)));
  it('ContainerImage with attached disks', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk, pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testContainerImage(results);
      testPvcStorage(results, 1, 0, 2, pvcDisk.name, getNamespace(selectVm(results)));
      return results;
    }));

  it('url source with attached disks', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsUrl,
      [],
      [rootDataVolumeDisk, pvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testPvcStorage(results, 1, 1, 2, pvcDisk.name, getNamespace(selectVm(results)));
      return results;
    }));

  it('user template with attached disks', () =>
    createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsUserTemplate,
      [],
      [pvcDisk, templateDataVolumeDisk],
      persistentVolumeClaims
    ).then(results => {
      testDataVolumeStorage(
        results,
        1,
        1,
        templateDataVolumeDisk.templateStorage.disk.name,
        templateDataVolumeDisk.templateStorage.dataVolume.metadata.name,
        templateDataVolumeDisk.templateStorage.dataVolume.metadata.namespace
      );
      testPvcStorage(results, 0, 0, 2, pvcDisk.name, getNamespace(selectVm(results)));
      return results;
    }));

  it('from PXE with attached disks', () => {
    const bootablePvcDisk = {
      ...pvcDisk,
      isBootable: true,
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsPxe,
      [podNetwork, multusNetwork],
      [bootablePvcDisk],
      persistentVolumeClaims
    ).then(results => {
      testPXE(results);
      testPvcStorage(results, 0, 0, 3, pvcDisk.name, getNamespace(selectVm(results)));
      return results;
    });
  });
  it('clones attached PVC disks', async () => {
    const results = await createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsPxe,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    );
    expect(results).toHaveLength(1);
    testPvcStorage(results, 0, 0, 3, pvcDisk.name, getNamespace(selectVm(results)));
    return results;
  });
});

describe('request.js - metadata', () => {
  it('adds description to VM ', () => {
    const withDescription = cloneDeep(vmSettingsContainer);
    withDescription[DESCRIPTION_KEY] = {
      value: 'foo description',
    };
    return createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      withDescription,
      [],
      [rootContainerDisk],
      persistentVolumeClaims
    ).then(results => {
      const vm = selectVm(results);
      expect(vm.metadata.annotations.description).toEqual(settingsValue(withDescription, DESCRIPTION_KEY));
      return results;
    });
  });
  it('VM has os/flavor/workload metadata', async () => {
    const results = await createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    );
    testMetadata(
      results,
      vmSettingsContainer[OPERATING_SYSTEM_KEY].value,
      vmSettingsContainer[WORKLOAD_PROFILE_KEY].value,
      vmSettingsContainer[FLAVOR_KEY].value,
      'rhel-generic',
      'openshift'
    );
    return results;
  });
  it('VM has os/flavor/workload metadata - user template', async () => {
    const results = await createVm(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsUserTemplate,
      [podNetwork, multusNetwork],
      [pvcDisk],
      persistentVolumeClaims
    );
    testMetadata(
      results,
      vmSettingsUserTemplate[OPERATING_SYSTEM_KEY].value,
      vmSettingsUserTemplate[WORKLOAD_PROFILE_KEY].value,
      vmSettingsUserTemplate[FLAVOR_KEY].value,
      getName(urlTemplate),
      getNamespace(urlTemplate)
    );
  });
});

describe('request.js - Create Vm Template', () => {
  it('creates VM Template', async () => {
    const results = await createVmTemplate(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk]
    );
    const vmTemplate = selectTemplate(results);
    expect(vmTemplate.metadata.name).toEqual(settingsValue(vmSettingsContainer, NAME_KEY));
    expect(vmTemplate.metadata.description).toBeUndefined();
    expect(vmTemplate.metadata.namespace).toEqual(settingsValue(vmSettingsContainer, NAMESPACE_KEY));
    expect(vmTemplate.kind).toEqual(TemplateModel.kind);
    expect(vmTemplate.apiVersion).toEqual(`${TemplateModel.apiGroup}/${TemplateModel.apiVersion}`);
    expect(vmTemplate.metadata.labels[TEMPLATE_TYPE_LABEL]).toEqual(TEMPLATE_TYPE_VM);
    expect(
      vmTemplate.metadata.labels[`${TEMPLATE_OS_LABEL}/${settingsValue(vmSettingsContainer, OPERATING_SYSTEM_KEY).id}`]
    ).toEqual('true');
    expect(
      vmTemplate.metadata.labels[
        `${TEMPLATE_WORKLOAD_LABEL}/${settingsValue(vmSettingsContainer, WORKLOAD_PROFILE_KEY)}`
      ]
    ).toEqual('true');
    expect(
      vmTemplate.metadata.labels[`${TEMPLATE_FLAVOR_LABEL}/${settingsValue(vmSettingsContainer, FLAVOR_KEY)}`]
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
  });
  it('adds description to VM Template', async () => {
    const withDescription = cloneDeep(vmSettingsContainer);
    withDescription[DESCRIPTION_KEY] = {
      value: 'foo description',
    };
    const results = await createVmTemplate(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      withDescription,
      [],
      [rootContainerDisk]
    );
    const vmTemplate = selectTemplate(results);
    expect(vmTemplate.metadata.annotations.description).toEqual(settingsValue(withDescription, DESCRIPTION_KEY));
    expect(get(vmTemplate.objects[0].metadata, 'annotations.description')).toBeUndefined();
  });
  it('PVC storage is not appended with vm name', async () => {
    const results = await createVmTemplate(
      new EnhancedK8sMethods({ k8sCreate }),
      templates,
      vmSettingsContainer,
      [],
      [rootContainerDisk, pvcDisk],
      persistentVolumeClaims
    );
    const vmTemplate = selectTemplate(results);
    testPvcStorage(vmTemplate.objects, 1, 0, 2, pvcDisk.name, getNamespace(vmTemplate));
  });
});
