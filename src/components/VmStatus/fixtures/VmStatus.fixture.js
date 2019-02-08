import { VmStatus } from '../VmStatus';

import {
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_OFF,
  VM_STATUS_STARTING,
  VM_STATUS_MIGRATING,
  VM_STATUS_RUNNING,
  VM_STATUS_OTHER,
  VM_STATUS_VMI_WAITING,
  DATA_VOLUME_STATUS_CLONE_SCHEDULED,
  DATA_VOLUME_STATUS_IMPORT_SCHEDULED,
  DATA_VOLUME_STATUS_UPLOAD_SCHEDULED,
  DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS,
  VM_STATUS_PREPARING_DISKS,
  DATA_VOLUME_STATUS_UPLOAD_IN_PROGRESS,
  DATA_VOLUME_STATUS_CLONE_IN_PROGRESS,
  DATA_VOLUME_STATUS_PENDING,
  DATA_VOLUME_STATUS_PVC_BOUND,
  VM_STATUS_DISKS_FAILED,
  DATA_VOLUME_STATUS_FAILED,
} from '../../../constants';
import { fullVm } from '../../../tests/mocks/vm/vm.mock';
import { dataVolumes } from '../../../tests/mocks/dataVolume';
import { getNamespace, getName } from '../../../utils';

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

const cloneDataVolume = {
  ...fullVm.spec.dataVolumeTemplates[0],
  metadata: {
    ...fullVm.spec.dataVolumeTemplates[0].metadata,
    namespace: getNamespace(fullVm),
  },
  status: {
    phase: DATA_VOLUME_STATUS_CLONE_SCHEDULED,
  },
};

const getImportDataVolume = phase => ({
  ...dataVolumes.url,
  status: {
    phase,
  },
});

const uploadDataVolume = {
  ...fullVm.spec.dataVolumeTemplates[1],
  metadata: {
    ...fullVm.spec.dataVolumeTemplates[1].metadata,
    namespace: getNamespace(fullVm),
  },
  status: {
    phase: DATA_VOLUME_STATUS_UPLOAD_SCHEDULED,
  },
};

const diskImportPod = {
  metadata: {
    name: `importer-${getName(getImportDataVolume())}-x9c99`,
    namespace: getNamespace(fullVm),
    labels: {
      app: 'containerized-data-importer',
      'cdi.kubevirt.io/storage.import.importPvcName': getName(getImportDataVolume()),
    },
  },
  status: {
    conditions: [{ type: 'PodScheduled', status: 'True' }],
  },
};

const diskImportPodFailed = {
  metadata: {
    name: `importer-${getName(getImportDataVolume())}-x9c99`,
    namespace: getNamespace(fullVm),
    labels: {
      app: 'containerized-data-importer',
      'cdi.kubevirt.io/storage.import.importPvcName': getName(getImportDataVolume()),
    },
  },
  status: {
    phase: 'Pending',
    conditions: [
      {
        type: 'PodScheduled',
        status: 'False',
        reason: 'Unschedulable',
      },
    ],
  },
};

const diskUploadPod = {
  metadata: {
    name: `cdi-upload-${getName(uploadDataVolume)}`,
    namespace: getNamespace(fullVm),
    labels: {
      app: 'containerized-data-importer',
    },
  },
  status: {
    conditions: [{ type: 'PodScheduled', status: 'True' }],
  },
};

const diskClonePod = {
  metadata: {
    name: 'clone-target-pod-x9c99',
    namespace: getNamespace(fullVm),
    labels: {
      app: 'containerized-data-importer',
      'cdi.kubevirt.io/storage.clone.cloneUniqeId': `${getName(cloneDataVolume)}-target-pod`,
    },
  },
  status: {
    conditions: [{ type: 'PodScheduled', status: 'True' }],
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

export const vmFixtures = {
  vmOff: {
    metadata,
    spec: { running: false },
    expected: VM_STATUS_OFF,
  },

  vmRunning: {
    metadata,
    spec: { running: true },
    status: {
      ready: true,
      created: true,
    },
    expected: VM_STATUS_RUNNING,
  },

  vmStarting: {
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

  vmStartingNoPod: {
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

  vmStartingPodHasNoConditions: {
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

  vmStartingPodError: {
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

  vmWaiting: {
    metadata,
    spec: { running: true },
    status: {
      created: false,
      ready: false,
    },
    expectedDetail: VM_STATUS_VMI_WAITING,
    expected: VM_STATUS_OTHER,
  },

  vmWaitingNoStatus: {
    metadata,
    spec: { running: true },
    status: {},
    expectedDetail: VM_STATUS_VMI_WAITING,
    expected: VM_STATUS_OTHER,
  },

  vmFailure: {
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

  vmFailure1: {
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

  vmPodError: {
    metadata,
    spec: { running: true },
    status: {
      created: true,
    },

    podFixture: podPullBackOff,
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_POD_ERROR,
  },

  vmMigrating: {
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

  vmPhaseFailed: {
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

  // disks statuses
  vmDisksImporting: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS,
    expectedPod: diskImportPod,
  },

  vmDisksImporting1: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_IMPORT_SCHEDULED)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS,
  },

  vmDisksImportPreparing: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_PENDING)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_PENDING,
  },

  vmDisksImportPreparing1: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_PVC_BOUND)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_PENDING,
  },

  vmDisksImportFailed: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_FAILED)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_DISKS_FAILED,
    expectedDisksStatus: DATA_VOLUME_STATUS_FAILED,
  },

  vmDisksImportPodFailed: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPodFailed, diskUploadPod, diskClonePod],
    dataVolumes: [getImportDataVolume(DATA_VOLUME_STATUS_IMPORT_IN_PROGRESS)],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_DISKS_FAILED,
  },

  vmDisksUploading: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [uploadDataVolume],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_UPLOAD_IN_PROGRESS,
    expectedPod: diskUploadPod,
  },

  vmDisksCloning: {
    ...fullVm,
    spec: {
      ...fullVm.spec,
      running: true,
    },

    cdiPods: [diskImportPod, diskUploadPod, diskClonePod],
    dataVolumes: [cloneDataVolume],
    expected: VM_STATUS_OTHER,
    expectedDetail: VM_STATUS_PREPARING_DISKS,
    expectedDisksStatus: DATA_VOLUME_STATUS_CLONE_IN_PROGRESS,
    expectedPod: diskClonePod,
  },
};

export default [
  {
    component: VmStatus,
    props: {
      vm: vmFixtures.vmOff,
    },
  },
  {
    component: VmStatus,
    props: {
      vm: vmFixtures.vmRunning,
    },
  },
];
