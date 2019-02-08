import { VmDetails } from '../VmDetails';
import { fedora28 } from '../../../../tests/mocks/template/fedora28.mock';
import { LABEL_USED_TEMPLATE_NAME, LABEL_USED_TEMPLATE_NAMESPACE } from '../../../../constants';

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
    spec: { running: true },
    status: {
      ready: true,
      created: true,
    },
  },
  vmWithLabels: {
    metadata: {
      ...metadata,
      labels: {
        'flavor.template.cnv.io/small': 'true',
        'os.template.cnv.io/fedora29': 'true',
        [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
        [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
        'workload.template.cnv.io/generic': 'true',
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
        'flavor.template.cnv.io/Custom': 'true',
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
        'flavor.template.cnv.io/small': 'true',
      },
    },
    spec: { running: false },
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
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
    },
  },
  {
    component: VmDetails,
    name: 'Running VM',
    props: {
      vm: vmFixtures.runningVm,
      vmi: vmiFixture,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
      NodeLink: () => true,
    },
  },
  {
    component: VmDetails,
    name: 'VM with description',
    props: {
      vm: vmFixtures.vmWithDescription,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
      NodeLink: () => true,
    },
  },
  {
    component: VmDetails,
    name: 'VM with flavor workload os',
    props: {
      vm: vmFixtures.vmWithLabels,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
      NodeLink: () => true,
    },
  },
  {
    component: VmDetails,
    name: 'VM with custom flavor',
    props: {
      vm: vmFixtures.customVm,
      k8sPatch: () =>
        new Promise(resolve => {
          resolve();
        }),
      k8sGet: () =>
        new Promise(resolve => {
          resolve(fedora28);
        }),
      NodeLink: () => true,
    },
  },
];
