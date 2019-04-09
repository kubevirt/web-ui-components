import React from 'react';

import { VmDetails } from '../VmDetails';
import { LABEL_USED_TEMPLATE_NAME, LABEL_USED_TEMPLATE_NAMESPACE, TEMPLATE_VM_NAME_LABEL } from '../../../../constants';
import { k8sPatch, k8sGet } from '../../../../tests/k8s';
import { services, ResourceLinkComponent } from '../../Services/fixtures/Services.fixture';

const metadata = {
  name: 'my-vm',
  namespace: 'my-namespace',
};

export const vmFixtures = {
  downVm: {
    metadata,
    spec: { running: false },
  },
  vmWithDescription: {
    metadata: {
      ...metadata,
      annotations: {
        description: 'This VM has a description',
      },
    },
    spec: { running: false },
  },
  runningVm: {
    metadata,
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              rng: {},
              interfaces: [
                { bridge: {}, name: 'podNetworkName', bootOrder: 2 },
                { bridge: {}, name: 'pxeNetworkName', bootOrder: 1 },
              ],
              disks: [
                { disk: {}, name: 'disk-one', bootOrder: 3 },
                { disk: {}, name: 'disk-two', bootOrder: 4 },
                { disk: {}, name: 'disk-three', bootOrder: 5 },
                { disk: { bus: 'virtio' }, name: 'cloudinitdisk' },
              ],
            },
          },
          volumes: [
            {
              cloudInitNoCloud: {
                userData: '# configure default password\npassword: fedora\nchpasswd: { expire: False }',
              },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
      running: true,
    },
    status: {
      ready: true,
      created: true,
    },
  },
  vmWithLabels: {
    metadata: {
      ...metadata,
      labels: {
        'flavor.template.kubevirt.io/small': 'true',
        'os.template.kubevirt.io/fedora29': 'true',
        [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
        [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
        'workload.template.kubevirt.io/generic': 'true',
      },
    },
    spec: {
      template: {
        spec: {
          domain: {
            cpu: {
              cores: 2,
            },
            resources: {
              requests: {
                memory: '2G',
              },
            },
          },
        },
      },
      running: false,
    },
  },
  vmWithDeletedTemplate: {
    metadata: {
      ...metadata,
      labels: {
        'flavor.template.kubevirt.io/small': 'true',
        'os.template.kubevirt.io/fedora29': 'true',
        [LABEL_USED_TEMPLATE_NAME]: 'deleted-template',
        [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
        'workload.template.kubevirt.io/generic': 'true',
      },
    },
    spec: {
      template: {
        spec: {
          domain: {
            cpu: {
              cores: 2,
            },
            resources: {
              requests: {
                memory: '2G',
              },
            },
          },
        },
      },
      running: false,
    },
  },
  customVm: {
    metadata: {
      ...metadata,
      labels: {
        'flavor.template.kubevirt.io/Custom': 'true',
      },
    },
    spec: {
      template: {
        spec: {
          domain: {
            cpu: {
              cores: 2,
              model: 'Conroe',
            },
            resources: {
              requests: {
                memory: '4G',
              },
            },
          },
        },
      },
      running: false,
    },
  },
  vmWithSmallFlavor: {
    metadata: {
      ...metadata,
      labels: {
        'flavor.template.kubevirt.io/small': 'true',
      },
    },
    spec: { running: false },
  },
  vmWithVmiLabels: {
    metadata: {
      ...metadata,
    },
    spec: {
      template: {
        metadata: {
          labels: {
            [TEMPLATE_VM_NAME_LABEL]: 'my-vm',
            fooSelector: 'fooValue',
          },
        },
      },
    },
  },
};

const vmiFixture = {
  apiVersion: 'kubevirt.io/v1alpha3',
  kind: 'VirtualMachineInstance',
  metadata: {
    name: 'my-vm-vmi',
    namespace: 'my-namespace',
  },
  status: {
    interfaces: [
      { ipAddress: '172.17.0.15', mac: '02:42:ac:11:00:0d', name: 'default' },
      { ipAddress: '172.17.0.16', mac: '02:42:ac:11:00:0e', name: 'backup1' },
      { ipAddress: '172.17.0.17', mac: '02:42:ac:11:00:0f', name: 'backup2' },
    ],
    nodeName: 'localhost',
    phase: 'Running',
  },
};

export default [
  {
    component: VmDetails,
    name: 'Offline VM',
    props: {
      vm: vmFixtures.downVm,
      k8sPatch,
      k8sGet,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'Running VM',
    props: {
      vm: vmFixtures.runningVm,
      vmi: vmiFixture,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM with description',
    props: {
      vm: vmFixtures.vmWithDescription,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM with flavor workload os',
    props: {
      vm: vmFixtures.vmWithLabels,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM with flavor with template resource link',
    props: {
      vm: vmFixtures.vmWithLabels,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      TemplateResourceLink: () => <a>default/fedora28</a>,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM with custom flavor',
    props: {
      vm: vmFixtures.customVm,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM detail as overview',
    props: {
      vm: vmFixtures.customVm,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      overview: true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM detail with deleted template',
    props: {
      vm: vmFixtures.vmWithDeletedTemplate,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
    },
  },
  {
    component: VmDetails,
    name: 'VM with services',
    props: {
      vm: vmFixtures.vmWithVmiLabels,
      k8sPatch,
      k8sGet,
      NodeLink: () => true,
      ResourceLinkComponent,
      services,
    },
  },
];
