import { createVM } from '../request';
import { rhel75 } from '../mock_templates/rhel75.template';
import { linuxUserTemplate } from '../mock_user_templates/linux.template';
import { ProcessedTemplatesModel } from '../../models';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_URL,
  PARAM_VM_NAME,
  templates
} from '../../constants';

const basicSettings = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: rhel75,
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

const basicSettingsCloudInit = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  chosenTemplate: rhel75,
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
  chosenTemplate: rhel75,
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
  chosenTemplate: rhel75,
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
  chosenTemplate: rhel75,
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
  chosenTemplate: linuxUserTemplate,
  imageSourceType: {
    value: 'Template'
  },
  cpu: {
    value: 3
  },
  memory: {
    value: 3
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

describe('request.js', () => {
  it('registryImage', () =>
    createVM(k8sCreate, templates, basicSettings).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
      expect(vm.spec.template.spec.domain.devices.disks[0].volumeName).toBe('rootvolume');

      expect(vm.spec.template.spec.volumes[0].name).toBe('rootvolume');
      expect(vm.spec.template.spec.volumes[0].registryDisk.image).toBe('imageURL');
      return vm;
    }));
  it('from URL', () =>
    createVM(k8sCreate, templates, vmFromURL).then(vm => {
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
    createVM(k8sCreate, templates, vmPXE).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.devices.interfaces[0].bootOrder).toBe(1);
      return vm;
    }));
  it('from User Template', () =>
    createVM(k8sCreate, vmUserTemplate).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(3);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('3G');
      return vm;
    }));
  it('with CloudInit', () =>
    createVM(k8sCreate, templates, basicSettingsCloudInit).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.devices.disks[1].name).toBe('cloudinitdisk');
      expect(vm.spec.template.spec.domain.devices.disks[1].volumeName).toBe('cloudinitvolume');

      expect(vm.spec.template.spec.volumes[1].name).toBe('cloudinitvolume');
      return vm;
    }));
  it('with custom flavor', () =>
    createVM(k8sCreate, customFlavor).then(vm => {
      expect(vm.metadata.name).toBe(basicSettings.name.value);
      expect(vm.metadata.namespace).toBe(basicSettings.namespace.value);
      expect(vm.spec.template.spec.domain.cpu.cores).toBe(1);
      expect(vm.spec.template.spec.domain.resources.requests.memory).toBe('1G');
      return vm;
    }));
});
