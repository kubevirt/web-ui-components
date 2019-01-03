import { VmDetails } from '../VmDetails';

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
        'template.cnv.ui': 'default_fedora-generic',
        'workload.template.cnv.io/generic': 'true',
      },
    },
    spec: { running: true },
    status: {
      ready: true,
      created: true,
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
      running: true,
    },
    status: {
      ready: true,
      created: true,
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

export default [
  {
    component: VmDetails,
    name: 'offline VM',
    props: {
      vm: vmFixtures.downVm,
    },
  },
  {
    component: VmDetails,
    name: 'running VM',
    props: {
      vm: vmFixtures.runningVm,
    },
  },
  {
    component: VmDetails,
    name: 'VM with description',
    props: {
      vm: vmFixtures.vmWithDescription,
    },
  },
  {
    component: VmDetails,
    name: 'VM with flavor workload os',
    props: {
      vm: vmFixtures.vmWithLabels,
    },
  },
  {
    component: VmDetails,
    name: 'VM with custom flavor',
    props: {
      vm: vmFixtures.customVm,
    },
  },
];
