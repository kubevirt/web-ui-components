import { get } from 'lodash';
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
import { linuxUserTemplate } from '../mock_user_templates/linux.template';

const basicSettings = {
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
    value: 'small'
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const basicSettingsWithNetwork = {
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
    value: 'small'
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const basicSettingsCloudInit = {
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
    value: 'small'
  },
  operatingSystem: {
    value: 'rhel7.0'
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
  imageSourceType: {
    value: PROVISION_SOURCE_URL
  },
  imageURL: {
    value: 'httpURL'
  },
  flavor: {
    value: 'small'
  },
  operatingSystem: {
    value: 'rhel7.0'
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
  imageSourceType: {
    value: PROVISION_SOURCE_PXE
  },
  flavor: {
    value: 'small'
  },
  startVM: {
    value: true
  },
  operatingSystem: {
    value: 'rhel7.0'
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
  },
  operatingSystem: {
    value: 'rhel7.0'
  }
};

const vmUserTemplate = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
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

const testRegistryImage = vm => {
  expect(vm.metadata.name).toBe(basicSettings.name.value);
  expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
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
      expect(vm.spec.template.spec.domain.devices.autoattachPodInterface).toBeUndefined();
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
  it('without CloudInit - disk and volume is not present', () =>
    createVM(k8sCreate, templates, basicSettings, networks).then(vm => {
      expect(vm.spec.template.spec.domain.devices.disks.some(disk => disk.name === 'cloudinitdisk')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.name === 'cloudinitvolume')).toBeFalsy();
      expect(vm.spec.template.spec.volumes.some(volume => volume.hasOwnProperty('cloudInitNoCloud'))).toBeFalsy();
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
});
