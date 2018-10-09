import { cloneDeep, get } from 'lodash';
import { createVM } from '../request';

import { ProcessedTemplatesModel } from '../../models';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_URL,
  PARAM_VM_NAME,
  templates,
  POD_NETWORK
} from '../../constants';
import { rhel75 } from '../mock_templates/rhel75.template';
import { linuxUserTemplate } from '../mock_user_templates/linux.template';

import { storages } from '../../components/Wizard/NewVmWizard/fixtures/NewVmWizard.fixture';

const basicSettings = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_REGISTRY
  },
  registryImage: {
    value: 'imageURL'
  },
  flavor: {
    value: 'small'
  }
};

const basicSettingsWithNetwork = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_REGISTRY
  },
  registryImage: {
    value: 'imageURL'
  },
  flavor: {
    value: 'small'
  }
};

const attachStorageDisks = [
  {
    id: 1,
    isBootable: true,
    attachStorage: storages[2]
  }
];

const basicSettingsCloudInit = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_REGISTRY
  },
  registryImage: {
    value: 'imageURL'
  },
  flavor: {
    value: 'small'
  },
  cloudInit: {
    value: true
  },
  hostname: {
    value: 'hostname'
  },
  authKeys: {
    value: 'keys'
  }
};

const vmFromURL = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  description: {
    value: 'desc'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_URL
  },
  imageURL: {
    value: 'httpURL'
  },
  flavor: {
    value: 'small'
  }
};

const vmPXE = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  description: {
    value: 'desc'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_PXE
  },
  flavor: {
    value: 'small'
  },
  startVM: {
    value: true
  }
};

const customFlavor = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  description: {
    value: 'desc'
  },
  chosenTemplate: cloneDeep(rhel75),
  imageSourceType: {
    value: PROVISION_SOURCE_REGISTRY
  },
  registryImage: {
    value: 'imageURL'
  },
  flavor: {
    value: CUSTOM_FLAVOR
  },
  cpu: {
    value: '1'
  },
  memory: {
    value: '1'
  },
  startVM: {
    value: true
  }
};

const vmUserTemplate = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: cloneDeep(linuxUserTemplate),
  imageSourceType: {
    value: 'Template'
  },
  userTemplate: {
    value: linuxUserTemplate.metadata.name
  },
  cpu: {
    value: 3
  },
  memory: {
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

const processTemplate = template =>
  new Promise((resolve, reject) => {
    const nameParam = template.parameters.find(param => param.name === PARAM_VM_NAME);
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

const testRegistryImage = vm => {
  expect(vm.metadata.name).toBe(basicSettings.name.value);
  expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
  expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
  expect(vm.spec.template.spec.domain.devices.disks[0].volumeName).toBe('rootvolume');

  expect(vm.spec.template.spec.volumes[0].name).toBe('rootvolume');
  expect(vm.spec.template.spec.volumes[0].registryDisk.image).toBe('imageURL');
  return vm;
};

describe('request.js', () => {
  it('registryImage', () => createVM(k8sCreate, templates, basicSettings, networks).then(testRegistryImage));
  it('from URL', () =>
    createVM(k8sCreate, templates, vmFromURL, networks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
      expect(vm.spec.template.spec.domain.devices.disks[0].volumeName).toBe('rootvolume');

      expect(vm.spec.template.spec.volumes[0].name).toBe('rootvolume');
      const dataVolumeName = `datavolume-${vmFromURL.name.value}`;
      expect(vm.spec.template.spec.volumes[0].dataVolume.name).toBe(dataVolumeName);

      expect(vm.spec.dataVolumeTemplates[0].metadata.name).toBe(dataVolumeName);
      expect(vm.spec.dataVolumeTemplates[0].spec.source.http.url).toBe(vmFromURL.imageURL.value);
      return vm;
    }));
  it('from PXE', () =>
    createVM(k8sCreate, templates, vmPXE, pxeNetworks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
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
    }));
  it('with non bootable networks', () =>
    createVM(k8sCreate, templates, basicSettingsWithNetwork, podNetworks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettingsWithNetwork.name.value);
      expect(vm.metadata.namespace).toBe(basicSettingsWithNetwork.namespace.value);
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
    createVM(k8sCreate, templates, vmUserTemplate, networks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(3);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('3G');
      return vm;
    }));
  it('with CloudInit', () =>
    createVM(k8sCreate, templates, basicSettingsCloudInit, networks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.devices.disks[1].name).toBe('cloudinitdisk');
      expect(vm.spec.template.spec.domain.devices.disks[1].volumeName).toBe('cloudinitvolume');

      expect(vm.spec.template.spec.volumes[1].name).toBe('cloudinitvolume');
      return vm;
    }));
  it('with custom flavor', () =>
    createVM(k8sCreate, templates, customFlavor, networks).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(1);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('1G');
      return vm;
    }));

  it('registryImage with attached disks', () =>
    createVM(k8sCreate, templates, basicSettings, attachStorageDisks).then(vm => {
      testRegistryImage(vm);
      testFirstAttachedStorage(vm, 1, 1, 1);
      return vm;
    }));

  it('from PXE with attached disks', () =>
    createVM(k8sCreate, templates, vmPXE, attachStorageDisks).then(vm => {
      testPXE(vm);
      testFirstAttachedStorage(vm, 0, 1, 2);
      return vm;
    }));
});
