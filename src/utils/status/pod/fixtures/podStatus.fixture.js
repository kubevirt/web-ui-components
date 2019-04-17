import {
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_NOT_READY,
  POD_STATUS_NOT_SCHEDULABLE,
  POD_STATUS_FAILED,
  POD_STATUS_CRASHLOOP_BACKOFF,
  POD_STATUS_PENDING,
  POD_STATUS_UNKNOWN,
  POD_STATUS_COMPLETED,
  POD_STATUS_RUNNING,
  POD_STATUS_SUCCEEDED,
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

const getWaitingContainerStatus = (ready = false, reason) => ({
  ready: false,
  state: {
    waiting: {
      reason,
    },
  },
});

const getTerminatedContainerStatus = (ready = false, reason, exitCode = 5) => ({
  ready: false,
  state: {
    terminated: {
      reason,
      exitCode,
    },
  },
});

const getResult = (status, message) => ({
  status,
  message,
});

export default [
  // 0
  {
    pod: getPod(),
    expected: getResult(POD_STATUS_UNKNOWN),
  },
  {
    pod: getPod('Unknown'),
    expected: getResult(POD_STATUS_UNKNOWN),
  },
  {
    pod: getPod('Pending', [getCondition('PodScheduled', 'False', 'Unschedulable')]),
    expected: getResult(POD_STATUS_NOT_SCHEDULABLE, 'Pod scheduling failed.'),
  },
  {
    pod: getPod('Failed', [], [getTerminatedContainerStatus(false, 'Error')]),
    expected: getResult(POD_STATUS_FAILED, 'Terminated with Error (exit code 5).'),
  },
  {
    pod: getPod('CrashLoopBackOff', [], [getWaitingContainerStatus(false, 'CrashLoopBackOff')]),
    expected: getResult(POD_STATUS_CRASHLOOP_BACKOFF, 'Waiting (CrashLoopBackOff).'),
  },
  // 5
  {
    pod: getPod('Pending', [], [getWaitingContainerStatus(false, 'CrashLoopBackOff')]),
    expected: getResult(POD_STATUS_CONTAINER_FAILING, 'Waiting (CrashLoopBackOff).'),
  },
  {
    pod: getPod('Pending', [getCondition('test', 'False', 'waiting-reason')]),
    expected: getResult(POD_STATUS_NOT_READY, 'Step: test'),
  },
  {
    pod: getPod('Pending'),
    expected: getResult(POD_STATUS_PENDING),
  },
  {
    pod: getPod('Running'),
    expected: getResult(POD_STATUS_RUNNING),
  },
  {
    pod: getPod('Completed'),
    expected: getResult(POD_STATUS_COMPLETED),
  },
  {
    pod: getPod('Succeeded'),
    expected: getResult(POD_STATUS_SUCCEEDED),
  },
];
