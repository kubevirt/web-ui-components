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
} from '../constants';

import { CDI_KUBEVIRT_IO, STORAGE_IMPORT_PVC_NAME } from '../../../../constants';

const podFixture = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
      },
      {
        type: 'Ready',
        status: 'False',
        message: 'fail description for Ready',
      },
      {
        type: 'ContainersReady',
        status: 'False',
        message: 'fail description for ContainersReady',
      },
      {
        type: 'PodScheduled',
        status: 'True',
      },
    ],
    containerStatuses: [],
    phase: 'Running',
  },
};

const podNotScheduledFixture = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
    labels: {
      [CDI_KUBEVIRT_IO]: 'importer',
      [`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]: 'testdisk',
    },
  },
  status: {
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
      },
      {
        type: 'Ready',
        status: 'False',
        message: 'fail description for Ready',
      },
      {
        type: 'ContainersReady',
        status: 'False',
        message: 'fail description for ContainersReady',
      },
      {
        type: 'PodScheduled',
        status: 'False',
        reason: 'Unschedulable',
      },
    ],
    containerStatuses: [],
    phase: 'Failed',
  },
};

const importPod = {
  metadata: {
    name: 'importer-datavolume-my-vm-x9c99',
    namespace: 'my-namespace',
    labels: {
      [CDI_KUBEVIRT_IO]: 'importer',
      [`${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`]: 'testdisk',
    },
  },
  status: {
    phase: 'Pending',
    conditions: [
      {
        type: 'PodScheduled',
        status: 'True',
      },
    ],
  },
};

const podPullBackOff = {
  metadata: {
    name: 'virt-launcher-my-vm-x9c99',
    namespace: 'my-namespace',
  },
  status: {
    phase: 'Failed',
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
      },
      {
        type: 'Ready',
        status: 'False',
        message: 'fail description for Ready',
      },
      {
        type: 'ContainersReady',
        status: 'False',
        message: 'fail description for ContainersReady',
      },
      {
        type: 'PodScheduled',
        status: 'True',
      },
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
    phase: 'Running',
    conditions: [],
    containerStatuses: [],
  },
};

const metadata = {
  name: 'my-vm',
  namespace: 'my-namespace',
};

const dataVolumeTemplates = [
  {
    metadata: {
      name: 'testdisk',
    },
  },
];

const getVm = (running = false, status, dvTemplates) => ({
  metadata,
  spec: { running, dataVolumeTemplates: dvTemplates },
  status: {
    ...status,
  },
});

const getMigration = phase => ({
  metadata: {
    namespace: 'my-namespace',
  },
  status: {
    phase,
  },
  spec: {
    vmiName: metadata.name,
  },
});

export default [
  {
    vm: getVm(),
    expectedSimple: VM_STATUS_OFF,
  },

  {
    vm: getVm(true, {
      ready: true,
      created: true,
    }),
    expectedSimple: VM_STATUS_RUNNING,
  },

  {
    vm: getVm(true, {
      ready: false,
      created: true,
    }),

    podsFixture: [podFixture], // helper, not part of the API object
    expected: VM_STATUS_STARTING,
    expectedSimple: VM_STATUS_OTHER,
  },

  {
    vm: getVm(true, {
      ready: false,
      created: true,
    }),

    podsFixture: undefined, // pod not yet created
    expected: VM_STATUS_STARTING,
    expectedSimple: VM_STATUS_OTHER,
  },

  {
    // 5
    vm: getVm(true, {
      ready: false,
      created: true,
    }),

    podsFixture: [podFixtureNoConditions], // helper, not part of the API object
    expected: VM_STATUS_STARTING,
    expectedSimple: VM_STATUS_OTHER,
  },

  {
    vm: getVm(true, {
      ready: false,
      created: true,
    }),

    podsFixture: [podNotScheduledFixture], // helper, not part of the API object
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_POD_ERROR,
  },

  {
    vm: getVm(true, {
      ready: false,
      created: false,
    }),

    expected: VM_STATUS_VMI_WAITING,
    expectedSimple: VM_STATUS_OTHER,
  },

  {
    vm: getVm(true),
    expected: VM_STATUS_VMI_WAITING,
    expectedSimple: VM_STATUS_OTHER,
  },

  {
    // issue in VM definition
    vm: getVm(true, {
      ready: false,
      created: false,
      conditions: [
        {
          type: 'Failure',
          message: 'Failure backend description',
        },
      ],
    }),

    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_ERROR,
  },

  {
    // 10
    // issue in VM definition
    vm: getVm(true, {
      ready: false,
      created: true,
      conditions: [
        {
          type: 'Failure',
          message: 'Failure backend description',
        },
      ],
    }),

    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_ERROR,
  },

  {
    vm: getVm(true, null, dataVolumeTemplates),

    importerPodsFixture: [podNotScheduledFixture], // helper, not part of the API object
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_IMPORT_ERROR,
  },

  {
    vm: getVm(true, {
      created: true,
    }),

    podsFixture: [podPullBackOff],
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_POD_ERROR,
  },

  {
    vm: getVm(true, {
      created: true,
      ready: true,
    }),

    migrations: [getMigration('Scheduling')],
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_MIGRATING,
  },

  {
    vm: getVm(true, {
      created: true,
      ready: true,
    }),

    migrations: [getMigration('Failed')],
    expectedSimple: VM_STATUS_RUNNING,
  },

  {
    // 15
    vm: getVm(true, null, dataVolumeTemplates),

    importerPodsFixture: [importPod],
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_IMPORTING,
  },

  {
    vm: getVm(true, null, dataVolumeTemplates),

    importerPodsFixture: [importPod, podNotScheduledFixture],
    expectedSimple: VM_STATUS_OTHER,
    expected: VM_STATUS_IMPORT_ERROR,
  },
];
