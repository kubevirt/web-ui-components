import {
  POD_STATUS_NOT_SCHEDULABLE,
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_NOT_READY,
  POD_STATUS_READY,
  POD_STATUS_FAILED,
  POD_STATUS_CRASHLOOP_BACKOFF,
} from './constants';

import {
  isPodSchedulable,
  findFailingContainerStatus,
  findFalseStatusConditionMessage,
  getContainerStatusReason,
  getStatusPhase,
} from '../../../selectors';

import { NOT_HANDLED } from '..';

const errorStatusMapper = {
  Failed: POD_STATUS_FAILED,
  CrashLoopBackOff: POD_STATUS_CRASHLOOP_BACKOFF,
};

const isSchedulable = pod => {
  if (!isPodSchedulable(pod)) {
    return {
      status: POD_STATUS_NOT_SCHEDULABLE,
      message: 'Pod scheduling failed.',
    };
  }
  return NOT_HANDLED;
};

const hasErrorStatus = pod => {
  const status = errorStatusMapper[getStatusPhase(pod)];

  if (status) {
    return {
      status,
      message: getContainerStatusReason(findFailingContainerStatus(pod)),
    };
  }
  return NOT_HANDLED;
};

const isContainerFailing = pod => {
  const failingContainer = findFailingContainerStatus(pod);
  if (failingContainer) {
    return {
      status: POD_STATUS_CONTAINER_FAILING,
      message: getContainerStatusReason(failingContainer),
    };
  }
  return NOT_HANDLED;
};
const isNotReady = pod => {
  const message = findFalseStatusConditionMessage(pod);
  if (message) {
    return {
      status: POD_STATUS_NOT_READY,
      message,
    };
  }
  return NOT_HANDLED;
};
export const getPodStatus = pod =>
  isSchedulable(pod) ||
  hasErrorStatus(pod) ||
  isContainerFailing(pod) ||
  isNotReady(pod) || { status: POD_STATUS_READY };
