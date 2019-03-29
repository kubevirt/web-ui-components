import {
  POD_STATUS_READY,
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_NOT_READY,
  POD_STATUS_NOT_SCHEDULABLE,
} from '../constants';

const metadata = {
  name: 'my-pod',
  namespace: 'my-namespace',
};

const getPod = (phase, conditions = [], containerStatuses = []) => ({
  metadata,
  status: {
    phase,
    conditions,
    containerStatuses,
  },
});

const getCondition = (type, status, reason) => ({
  type,
  status,
  reason,
});

const getContainerStatus = (ready = false, reason) => ({
  ready: false,
  state: {
    waiting: {
      reason,
    },
  },
});

const getResult = (status, message) => ({
  status,
  message,
});

export default [
  {
    pod: getPod(),
    expected: getResult(POD_STATUS_READY),
  },
  {
    pod: getPod('Pending', [getCondition('PodScheduled', 'False', 'Unschedulable')]),
    expected: getResult(POD_STATUS_NOT_SCHEDULABLE, 'Pod scheduling failed.'),
  },
  {
    pod: getPod(null, [], [getContainerStatus(false, 'CrashLoopBackOff')]),
    expected: getResult(POD_STATUS_CONTAINER_FAILING),
  },
  {
    pod: getPod(null, [getCondition('test', 'False', 'waiting-reason')]),
    expected: getResult(POD_STATUS_NOT_READY, 'Step: test'),
  },
];
