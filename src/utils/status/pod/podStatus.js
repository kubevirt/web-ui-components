import {
  POD_STATUS_NOT_SCHEDULABLE,
  POD_STATUS_CONTAINER_FAILING,
  POD_STATUS_NOT_READY,
  POD_STATUS_READY,
} from './constants';

import {
  isPodSchedulable,
  findFailingContainerStatus,
  findFalseStatusConditionMessage,
  getContainerStatusReason,
} from '../../../selectors';

import { NOT_HANDLED } from '..';

const isSchedulable = pod => {
  if (!isPodSchedulable(pod)) {
    return {
      status: POD_STATUS_NOT_SCHEDULABLE,
      message: 'Pod scheduling failed.',
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
  isSchedulable(pod) || isContainerFailing(pod) || isNotReady(pod) || { status: POD_STATUS_READY };
