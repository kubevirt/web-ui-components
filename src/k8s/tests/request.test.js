import { get } from 'lodash';
import { createVM } from '../request';
import { settingsValue } from '../selectors';

import { ProcessedTemplatesModel } from '../../models';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_URL,
  TEMPLATE_PARAM_VM_NAME,
  templates,
  POD_NETWORK
} from '../../constants';

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
  AUTHKEYS_KEY,
  OPERATING_SYSTEM_KEY
} from '../../components/Wizard/CreateVmWizard/constants';

import { linuxUserTemplate } from '../mock_user_templates/linux.template';

import { persistentVolumeClaims } from '../../components/Wizard/NewVmWizard/fixtures/NewVmWizard.fixture';

const basicSettings = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_REGISTRY
  },
  [REGISTRY_IMAGE_KEY]: {
    value: 'imageURL'
  },
  [FLAVOR_KEY]: {
    value: 'small'
  },
  [OPERATING_SYSTEM_KEY]: {
    value: 'rhel7.0'
  }
};

const basicSettingsWithNetwork = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_REGISTRY
  },
  [REGISTRY_IMAGE_KEY]: {
    value: 'imageURL'
  },
  [FLAVOR_KEY]: {
    value: 'small'
  },
  [OPERATING_SYSTEM_KEY]: {
    value: 'rhel7.0'
  }
};

const attachStorageDisks = [
  {
    id: 1,
    isBootable: true,
    attachStorage: persistentVolumeClaims[2]
  }
];

const attachStorageDisksWithLinuxUserTemplate = [
  ...attachStorageDisks,
  {
    id: 2,
    templateStorage: {
      pvc: linuxUserTemplate.objects[1],
      disk: linuxUserTemplate.objects[0].spec.template.spec.domain.devices.disks[0],
      volume: linuxUserTemplate.objects[0].spec.template.spec.volumes[0]
    }
  }
];

const basicSettingsCloudInit = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_REGISTRY
  },
  [REGISTRY_IMAGE_KEY]: {
    value: 'imageURL'
  },
  [FLAVOR_KEY]: {
    value: 'small'
  },
  [OPERATING_SYSTEM_KEY]: {
    value: 'rhel7.0'
  },
  [CLOUD_INIT_KEY]: {
    value: true
  },
  [HOST_NAME_KEY]: {
    value: 'hostname'
  },
  [AUTHKEYS_KEY]: {
    value: 'keys'
  }
};

const vmFromURL = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [DESCRIPTION_KEY]: {
    value: 'desc'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_URL
  },
  [IMAGE_URL_KEY]: {
    value: 'httpURL'
  },
  [FLAVOR_KEY]: {
    value: 'small'
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const vmPXE = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [DESCRIPTION_KEY]: {
    value: 'desc'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_PXE
  },
  [FLAVOR_KEY]: {
    value: 'small'
  },
  [START_VM_KEY]: {
    value: true
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const customFlavor = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [DESCRIPTION_KEY]: {
    value: 'desc'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: PROVISION_SOURCE_REGISTRY
  },
  [REGISTRY_IMAGE_KEY]: {
    value: 'imageURL'
  },
  [FLAVOR_KEY]: {
    value: CUSTOM_FLAVOR
  },
  [CPU_KEY]: {
    value: '1'
  },
  [MEMORY_KEY]: {
    value: '1'
  },
  [START_VM_KEY]: {
    value: true
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const vmUserTemplate = {
  [NAME_KEY]: {
    value: 'name'
  },
  [NAMESPACE_KEY]: {
    value: 'namespace'
  },
  [IMAGE_SOURCE_TYPE_KEY]: {
    value: 'Template'
  },
  [USER_TEMPLATE_KEY]: {
    value: linuxUserTemplate.metadata.name
  },
  [CPU_KEY]: {
    value: 3
  },
  [MEMORY_KEY]: {
    value: 3
  }
};

const networks = { networks: [] };

const podNetworks = {
  networks: [
    {
      name: 'podNetworkName',
      network: POD_NETWORK
    }
  ]
};

const pxeNetworks = {
  networks: [
    ...podNetworks.networks,
    {
      name: 'pxeNetworkName',
      network: 'networkConfig',
      isBootable: true
    }
  ]
};

const windowsSettings = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  imageSourceType: {
    value: PROVISION_SOURCE_REGISTRY
  },
  registryImage: {
    value: 'imageURL'
  },
  flavor: {
    value: 'medium'
  },
  operatingSystem: {
    value: 'win2k12r2'
  }
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

const testFirstAttachedStorage = (vm, volumeIndex, disksIndex, bootOrder) => {
  const storage = attachStorageDisks[0];
  const attachStorageName = storage.attachStorage.metadata.name;

  expect(vm.spec.template.spec.volumes[volumeIndex].name).toBe(attachStorageName);
  expect(vm.spec.template.spec.volumes[volumeIndex].persistentVolumeClaim.claimName).toBe(attachStorageName);
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].name).toBe(attachStorageName);
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].volumeName).toBe(attachStorageName);
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].bootOrder).toBe(
    storage.isBootable ? bootOrder : undefined
  );
};

const testTemplateStorage = (vm, volumeIndex, disksIndex, bootOrder) => {
  const storage = attachStorageDisksWithLinuxUserTemplate[1];
  const { volume, disk } = storage.templateStorage;

  expect(vm.spec.template.spec.volumes[volumeIndex].name).toBe(volume.name);
  expect(vm.spec.template.spec.volumes[volumeIndex].persistentVolumeClaim.claimName).toBe(
    volume.persistentVolumeClaim.claimName
  );
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].name).toBe(disk.name);
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].volumeName).toBe(disk.volumeName);
  expect(vm.spec.template.spec.domain.devices.disks[disksIndex].bootOrder).toBe(
    storage.isBootable ? bootOrder : undefined
  );
};

const testRegistryImage = vm => {
  expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
  expect(vm.spec.template.spec.domain.devices.disks[0].volumeName).toBe('rootvolume');

  expect(vm.spec.template.spec.volumes[0].name).toBe('rootvolume');
  expect(vm.spec.template.spec.volumes[0].registryDisk.image).toBe('imageURL');
  return vm;
};

const everyDiskHasVolue = vm => {
  vm.spec.template.spec.domain.devices.disks.forEach(disk => {
    expect(vm.spec.template.spec.volumes.filter(volume => volume.name === disk.volumeName)).toHaveLength(1);
  });
};

const testPXE = vm => {
  expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
  expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
  expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(2);
  expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetworks.networks[0].name);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].bootOrder).toBe(1);
  expect(vm.spec.template.spec.domain.devices.interfaces[1].name).toEqual(pxeNetworks.networks[1].name);
  expect(vm.spec.template.spec.networks).toHaveLength(2);
  expect(vm.spec.template.spec.networks[0].name).toEqual(podNetworks.networks[0].name);
  expect(vm.spec.template.spec.networks[1].name).toEqual(pxeNetworks.networks[1].name);
  expect(vm.spec.template.spec.networks[1].multus.networkName).toEqual(pxeNetworks.networks[1].network);

  expect(vm.metadata.annotations['cnv.ui.pxeInterface']).toEqual(pxeNetworks.networks[1].name);
  expect(vm.metadata.annotations['cnv.ui.firstBoot']).toBeTruthy();
  return vm;
};

describe('request.js', () => {
  it('registryImage', () => createVM(k8sCreate, templates, basicSettings, networks).then(testRegistryImage));
  it('from URL', () =>
    createVM(k8sCreate, templates, vmFromURL, networks).then(vm => {
      expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
      expect(vm.spec.template.spec.domain.devices.disks[0].volumeName).toBe('rootvolume');

      expect(vm.spec.template.spec.volumes[0].name).toBe('rootvolume');
      const dataVolumeName = `datavolume-${settingsValue(vmFromURL, NAME_KEY)}`;
      expect(vm.spec.template.spec.volumes[0].dataVolume.name).toBe(dataVolumeName);

      expect(vm.spec.dataVolumeTemplates[0].metadata.name).toBe(dataVolumeName);
      expect(vm.spec.dataVolumeTemplates[0].spec.source.http.url).toBe(settingsValue(vmFromURL, IMAGE_URL_KEY));
      return vm;
    }));
  it('from PXE', () => createVM(k8sCreate, templates, vmPXE, pxeNetworks).then(testPXE));
  it('with non bootable networks', () =>
    createVM(k8sCreate, templates, basicSettingsWithNetwork, podNetworks).then(vm => {
      expect(vm.metadata.name).toBe(settingsValue(basicSettingsWithNetwork, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettingsWithNetwork, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeUndefined();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(podNetworks.networks[0].name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].bootOrder).toBeUndefined();
      expect(vm.spec.template.spec.networks).toHaveLength(1);
      expect(vm.spec.template.spec.networks[0].name).toEqual(podNetworks.networks[0].name);
      expect(vm.spec.template.spec.networks[0].pod).toEqual({});

      expect(get(vm.metadata.annotations, 'cnv.ui.pxeInterface')).toBeUndefined();
      expect(get(vm.metadata.annotations, 'cnv.ui.firstBoot')).toBeUndefined();
      return vm;
    }));
  it('from User Template', () =>
    createVM(k8sCreate, templates, vmUserTemplate, networks, attachStorageDisksWithLinuxUserTemplate).then(vm => {
      expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(3);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('3G');

      expect(vm.spec.template.spec.volumes).toHaveLength(2);
      expect(vm.spec.template.spec.domain.devices.disks).toHaveLength(2);
      testTemplateStorage(vm, 0, 0);
      testFirstAttachedStorage(vm, 1, 1, 1);
      return vm;
    }));
  it('with CloudInit', () =>
    createVM(k8sCreate, templates, basicSettingsCloudInit, networks).then(vm => {
      expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.devices.disks[1].name).toBe('cloudinitdisk');
      expect(vm.spec.template.spec.domain.devices.disks[1].volumeName).toBe('cloudinitvolume');

      expect(vm.spec.template.spec.volumes[1].name).toBe('cloudinitvolume');
      return vm;
    }));
  it('without CloudInit - disk and volume is not present', () =>
    createVM(k8sCreate, templates, basicSettings, networks).then(vm => {
      expect(vm.spec.template.spec.domain.devices.disks.some(disk => disk.name === 'cloudinitdisk')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.name === 'cloudinitvolume')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.hasOwnProperty('cloudInitNoCloud'))).toBeFalsy();
      return vm;
    }));
  it('with custom flavor', () =>
    createVM(k8sCreate, templates, customFlavor, networks).then(vm => {
      expect(vm.metadata.name).toBe(settingsValue(basicSettings, NAME_KEY));
      expect(vm.metadata.namespace).toBe(settingsValue(basicSettings, NAMESPACE_KEY));
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(1);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('1G');
      return vm;
    }));
  it('default network model is used for all networks', () =>
    createVM(k8sCreate, templates, windowsSettings, pxeNetworks).then(vm => {
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(2);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual(pxeNetworks.networks[0].name);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].model).toEqual('e1000e');

      expect(vm.spec.template.spec.domain.devices.interfaces[1].name).toEqual(pxeNetworks.networks[1].name);
      expect(vm.spec.template.spec.domain.devices.interfaces[1].model).toEqual('e1000e');

      expect(vm.spec.template.spec.networks).toHaveLength(2);
      expect(vm.spec.template.spec.networks[0].name).toEqual(pxeNetworks.networks[0].name);
      expect(vm.spec.template.spec.networks[1].name).toEqual(pxeNetworks.networks[1].name);
      return vm;
    }));
  it('without network', () =>
    createVM(k8sCreate, templates, customFlavor, networks).then(vm => {
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
      expect(vm.spec.template.spec.domain.devices.interfaces).toBeUndefined();
      expect(vm.spec.template.spec.networks).toBeUndefined();
      return vm;
    }));
  it('with multus network and no pod network', () =>
    createVM(k8sCreate, templates, customFlavor, { networks: pxeNetworks.networks.slice(1, 2) }).then(vm => {
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeFalsy();
      expect(vm.spec.template.spec.domain.devices.interfaces).toHaveLength(1);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].name).toEqual('pxeNetworkName');
      expect(vm.spec.template.spec.networks).toHaveLength(1);
      expect(vm.spec.template.spec.networks[0].name).toEqual('pxeNetworkName');
      return vm;
    }));
  it('every disk has volume', () =>
    createVM(k8sCreate, templates, basicSettings, networks).then(vm => everyDiskHasVolue(vm)));
  it('every disk has volume - cloud init', () =>
    createVM(k8sCreate, templates, basicSettingsCloudInit, networks).then(vm => everyDiskHasVolue(vm)));

  it('registryImage with attached disks', () =>
    createVM(k8sCreate, templates, basicSettings, networks, attachStorageDisks).then(vm => {
      testRegistryImage(vm);
      testFirstAttachedStorage(vm, 1, 1, 1);
      return vm;
    }));

  it('from PXE with attached disks', () =>
    createVM(k8sCreate, templates, vmPXE, pxeNetworks, attachStorageDisks).then(vm => {
      testPXE(vm);
      testFirstAttachedStorage(vm, 1, 1, 2);
      return vm;
    }));
});
