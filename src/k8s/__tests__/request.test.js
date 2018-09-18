import * as request from '../request';
import { omit } from 'lodash';
import {
  API_VERSION,
  VM_KIND,
  OS_LABEL,
  FLAVOR_LABEL,
  REGISTRY_DISK,
  REGISTRY_VOLUME,
  VIRTIO_BUS,
  CLOUDINIT_DISK,
  CLOUDINIT_VOLUME
} from '../../constants';

const minimalBasicSettings = {
  name: {
    value: 'name'
  },
  namespace: {
    value: 'namespace'
  },
  operatingSystem: {
    value: 'os'
  },
  flavor: {
    value: 'flavor'
  },
  imageSourceType: {
    value: 'Registry'
  },
  registryImage: {
    value: 'imageURL'
  }
};

const withDescriptionSettings = {
  ...minimalBasicSettings,
  description: {
    value: 'desc'
  }
};

const runAfterCreationSettings = {
  ...minimalBasicSettings,
  startVM: {
    value: true
  }
};

const customFlavorBasicSettings = {
  ...minimalBasicSettings,
  flavor: {
    value: 'Custom'
  },
  cpu: {
    value: 3
  },
  memory: {
    value: 3
  }
};

const cloudInitSettings = {
  ...minimalBasicSettings,
  cloudInit: {
    value: true
  },
  hostname: {
    value: 'hostnameValue'
  },
  authKeys: {
    value: 'authKeysValue'
  }
};

const minimalVM = {
  apiVersion: API_VERSION,
  kind: VM_KIND,
  metadata: {
    name: minimalBasicSettings.name.value,
    namespace: minimalBasicSettings.namespace.value,
    labels: {
      [OS_LABEL]: minimalBasicSettings.operatingSystem.value
    }
  },
  spec: {
    running: false,
    template: {
      spec: {
        metadata: {
          labels: {
            [FLAVOR_LABEL]: minimalBasicSettings.flavor.value
          }
        },
        domain: {
          devices: {
            disks: [
              {
                name: REGISTRY_DISK,
                volumeName: REGISTRY_VOLUME,
                disk: {
                  bus: VIRTIO_BUS
                }
              }
            ]
          }
        },
        volumes: [
          {
            name: REGISTRY_VOLUME,
            registryDisk: {
              image: minimalBasicSettings.registryImage.value
            }
          }
        ]
      }
    }
  }
};

const withDescriptionVM = {
  ...minimalVM,
  metadata: {
    ...minimalVM.metadata,
    labels: {
      ...minimalVM.metadata.labels,
      description: withDescriptionSettings.description.value
    }
  }
};

const runAfterCreationVM = {
  ...minimalVM,
  spec: {
    ...minimalVM.spec,
    running: true
  }
};

const cludInitVm = {
  ...minimalVM,
  spec: {
    ...minimalVM.spec,
    template: {
      ...minimalVM.spec.template,
      spec: {
        ...minimalVM.spec.template.spec,
        domain: {
          ...minimalVM.spec.template.spec.domain,
          devices: {
            disks: [
              ...minimalVM.spec.template.spec.domain.devices.disks,
              {
                name: CLOUDINIT_DISK,
                volumeName: CLOUDINIT_VOLUME,
                disk: {
                  bus: VIRTIO_BUS
                }
              }
            ]
          }
        },
        volumes: [
          ...minimalVM.spec.template.spec.volumes,
          {
            name: CLOUDINIT_VOLUME,
            cloudInitNoCloud: {
              userData:
                'users:\n  - name:\n  - root\n    ssh-authorized-keys:\n  - authKeysValue\nhostname:\n  - hostnameValue'
            }
          }
        ]
      }
    }
  }
};

const customFlavorVM = omit(minimalVM, 'spec.template.spec.metadata');
customFlavorVM.spec.template.spec.domain.cpu = {
  cores: customFlavorBasicSettings.cpu.value
};
customFlavorVM.spec.template.spec.domain.resources = {
  requests: {
    memory: `${customFlavorBasicSettings.memory.value}Gi`
  }
};

describe('Create VM JSON', () => {
  it('minimal VM JSON', () => {
    expect(request.generateVmJson(minimalBasicSettings)).toEqual(minimalVM);
  });
  it('with Description', () => {
    expect(request.generateVmJson(withDescriptionSettings)).toEqual(withDescriptionVM);
  });
  it('with custom flavor', () => {
    expect(request.generateVmJson(customFlavorBasicSettings)).toEqual(customFlavorVM);
  });
  it('with running VM', () => {
    expect(request.generateVmJson(runAfterCreationSettings)).toEqual(runAfterCreationVM);
  });
  it('with cloudInit', () => {
    expect(request.generateVmJson(cloudInitSettings)).toEqual(cludInitVm);
  });
});
