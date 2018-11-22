import { VmStatus } from '../VmStatus';

import {
  VM_STATUS_UNKNOWN,
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_ERROR_COMMON,
  VM_STATUS_OFF,
  VM_STATUS_STARTING,
  VM_STATUS_RUNNING,
} from '../../../index';

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
    containerStatuses: {},
  },
};

const podNotScheduledFixture = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [
      { type: 'Initialized', status: 'True' },
      { type: 'Ready', status: 'False', message: 'fail description for Ready' },
      { type: 'ContainersReady', status: 'False', message: 'fail description for ContainersReady' },
      { type: 'PodScheduled', status: 'False', reason: 'Unschedulable' },
    ],
    containerStatuses: {},
  },
};

const podFixtureNoConditions = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [],
    containerStatuses: {},
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
    expected: VM_STATUS_STARTING,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: undefined, // pod not yet created
    expected: VM_STATUS_STARTING,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: podFixtureNoConditions, // helper, not part of the API object
    expected: VM_STATUS_STARTING,
  },

  {
    // 5
    metadata,
    spec: { running: true },
    status: {
      created: true,
      ready: false,
    },

    podFixture: podNotScheduledFixture, // helper, not part of the API object
    expected: VM_STATUS_ERROR_COMMON,
    expectedDetail: VM_STATUS_POD_ERROR,
  },

  {
    metadata,
    spec: { running: true },
    status: {
      created: false,
      ready: false,
    },
    expected: VM_STATUS_UNKNOWN,
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
    expected: VM_STATUS_ERROR_COMMON,
    expectedDetail: VM_STATUS_ERROR,
  },

  {
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
    expected: VM_STATUS_ERROR_COMMON,
    expectedDetail: VM_STATUS_ERROR,
  },

  {
    // 9
    metadata,
    spec: { running: true },
    status: {},

    importerPodFixture: podNotScheduledFixture, // helper, not part of the API object
    expected: VM_STATUS_ERROR_COMMON,
    expectedDetail: VM_STATUS_IMPORT_ERROR,
  },
];

/* Skip due to missing reference on <Link> ; TODO: fix if ever needed
export default vmFixtures.map(vmFixt => ({
  component: VmStatus,
  props: {
    vm: vmFixt,
    pod: vmFixt.podFixture
  }
}));
*/

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
