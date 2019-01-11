import { VmStatus } from '../VmStatus';

import {
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_OFF,
  VM_STATUS_STARTING,
  VM_STATUS_MIGRATING,
  VM_STATUS_RUNNING,
  VM_STATUS_OTHER,
  VM_STATUS_VMI_WAITING,
  VM_STATUS_IMPORTING,
  CDI_KUBEVIRT_IO,
  STORAGE_IMPORT_PVC_NAME,
} from '../../../constants';

const podFixture = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [
      { type: 'Initialized', status: 'True' },
      { type: 'Ready', status: 'False', message: 'fail description for Ready' },
      { type: 'ContainersReady', status: 'False', message: 'fail description for ContainersReady' },
      { type: 'PodScheduled', status: 'True' },
    ],
    containerStatuses: [],
  },
};

const podNotScheduledFixture = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
    labels: {
      [`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]: 'testdisk',
    },
  },
  status: {
    conditions: [
      { type: 'Initialized', status: 'True' },
      { type: 'Ready', status: 'False', message: 'fail description for Ready' },
      { type: 'ContainersReady', status: 'False', message: 'fail description for ContainersReady' },
      { type: 'PodScheduled', status: 'False', reason: 'Unschedulable' },
    ],
    containerStatuses: [],
  },
};

const importPod = {
  metadata: {
    name: 'importer-datavolume-my-vm-x9c99',
    namespace: 'my-namespace',
    labels: {
      [`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]: 'testdisk',
    },
  },
  status: {
    conditions: [{ type: 'PodScheduled', status: 'True' }],
  },
};

const podPullBackOff = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [
      { type: 'Initialized', status: 'True' },
      { type: 'Ready', status: 'False', message: 'fail description for Ready' },
      { type: 'ContainersReady', status: 'False', message: 'fail description for ContainersReady' },
      { type: 'PodScheduled', status: 'True' },
    ],
    containerStatuses: [
      {
        name: 'compute',
        state: {
          terminated: {
            exitCode: 2,
            reason: 'Error',
          },
        },
      },
      {
        name: 'volumerootvolume',
        state: {
          waiting: {
            reason: 'ImagePullBackOff',
            message: 'Back-off pulling image message',
          },
        },
      },
    ],
  },
};

const podFixtureNoConditions = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [],
    containerStatuses: [],
  },
};

const metadata = {
  name: 'my-vm',
  namespace: 'my-namespace',
};

export const vmFixtures = [
  {
    metadata,
    spec: { running: false },
    expected: VM_STATUS_OFF,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      ready: true,
      created: true,
    },
    expected: VM_STATUS_RUNNING,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture, // helper, not part of the API object
    expectedDetail: VM_STATUS_STARTING,
    expected: VM_STATUS_OTHER,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: undefined, // pod not yet created
    expectedDetail: VM_STATUS_STARTING,
    expected: VM_STATUS_OTHER,
  },

  {
    // 5
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: podFixtureNoConditions, // helper, not part of the API object
    expectedDetail: VM_STATUS_STARTING,
    expected: VM_STATUS_OTHER,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: podNotScheduledFixture, // helper, not part of the API object
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_POD_ERROR,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: false,
      ready: false,
    },
    expectedDetail: VM_STATUS_VMI_WAITING,
    expected: VM_STATUS_OTHER,
  },

  {
    metadata,
    spec: { running: true },
    status: {},
    expectedDetail: VM_STATUS_VMI_WAITING,
    expected: VM_STATUS_OTHER,
  },

  {
    // issue in VM definition
    metadata,
    spec: { running: true },
    status: {
      created: false,
      ready: false,

      conditions: [
        {
          type: 'Failure',
          message: 'Failure backend description',
        },
      ],
    },
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_ERROR,
  },

  {
    // 10
    // issue in VM definition
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,

      conditions: [
        {
          type: 'Failure',
          message: 'Failure backend description',
        },
      ],
    },
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_ERROR,
  },

  {
    metadata,
    spec: { running: true },
    status: {},

    importerPodsFixture: [podNotScheduledFixture], // helper, not part of the API object
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_IMPORT_ERROR,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
    },

    podFixture: podPullBackOff,
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_POD_ERROR,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: true,
    },

    migration: {
      status: {
        phase: 'Scheduling',
      },
    },
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_MIGRATING,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: true,
    },

    migration: {
      status: {
        phase: 'Failed',
      },
    },
    expected: VM_STATUS_RUNNING,
  },

  {
    // 15
    metadata,
    spec: { running: true },
    status: {},

    importerPodsFixture: [importPod],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_IMPORTING,
  },

  {
    metadata,
    spec: { running: true },
    status: {},

    importerPodsFixture: [importPod, podNotScheduledFixture],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_IMPORT_ERROR,
  },
];

export default [
  {
    component: VmStatus,
    props: {
      vm: vmFixtures[0],
    },
  },
  {
    component: VmStatus,
    props: {
      vm: vmFixtures[1],
    },
  },
];
