import {
  NODE_STATUS_NETWORK_UNAVAILABLE,
  NODE_STATUS_OUT_OF_DISK,
  NODE_STATUS_NOT_READY,
  NODE_STATUS_NOT_RESPONDING,
  NODE_STATUS_READY,
  NODE_STATUS_MEMORY_PRESSURE,
  NODE_STATUS_DISK_PRESSURE,
  NODE_STATUS_PID_PRESSURE,
  NODE_STATUS_UNDER_MAINTENANCE,
  NODE_STATUS_STOPPING_MAINTENANCE,
} from './constants';

import { getStatusConditions, findNodeMaintenance, getDeletionTimestamp } from '../../../selectors';

import { NOT_HANDLED } from '..';

const errorConditionsMapper = {
  NetworkUnavailable: NODE_STATUS_NETWORK_UNAVAILABLE,
  OutOfDisk: NODE_STATUS_OUT_OF_DISK,
};

const warnConditionsMapper = {
  MemoryPressure: NODE_STATUS_MEMORY_PRESSURE,
  PIDPressure: NODE_STATUS_DISK_PRESSURE,
  DiskPressure: NODE_STATUS_PID_PRESSURE,
};

const isNotReady = statusConditions => {
  const readyCondition = statusConditions.find(c => c.type === 'Ready');
  if (!readyCondition || readyCondition.status !== 'True') {
    return {
      status:
        readyCondition && readyCondition.status === 'Unknown' ? NODE_STATUS_NOT_RESPONDING : NODE_STATUS_NOT_READY,
      message: readyCondition && readyCondition.message,
    };
  }
  return NOT_HANDLED;
};

const hasErrorStatus = statusConditions => {
  const errorCondition = statusConditions.find(c => errorConditionsMapper[c.type]);
  if (errorCondition) {
    return {
      status: errorConditionsMapper[errorCondition.type],
      message: errorCondition.message,
    };
  }
  return NOT_HANDLED;
};

const hasWarnStatus = statusConditions => {
  const warnCondition = statusConditions.find(c => warnConditionsMapper[c.type]);
  if (warnCondition) {
    return {
      status: warnConditionsMapper[warnCondition.type],
      message: warnCondition.message,
    };
  }
  return NOT_HANDLED;
};

const hasFailedUnknownStatus = statusConditions => {
  if (statusConditions[0]) {
    return {
      status: NODE_STATUS_NOT_READY,
      message: statusConditions[0].message,
    };
  }
  return NOT_HANDLED;
};

const isUnderMaintanance = maintenance => {
  if (maintenance && !getDeletionTimestamp(maintenance)) {
    return {
      status: NODE_STATUS_UNDER_MAINTENANCE,
      maintenance,
    };
  }
  return NOT_HANDLED;
};

const isStoppingMaintanance = maintenance => {
  if (maintenance && getDeletionTimestamp(maintenance)) {
    return {
      status: NODE_STATUS_STOPPING_MAINTENANCE,
      maintenance,
    };
  }
  return NOT_HANDLED;
};

export const getNodeStatus = (node, maintenances) => {
  const allStatusConditions = getStatusConditions(node);
  const trueStatusConditions = allStatusConditions.filter(
    condition => condition.status === 'True' && condition.type !== 'Ready'
  );

  const maintenance = findNodeMaintenance(node, maintenances);

  return (
    isUnderMaintanance(maintenance) ||
    isStoppingMaintanance(maintenance) ||
    hasErrorStatus(trueStatusConditions) ||
    isNotReady(allStatusConditions) ||
    hasWarnStatus(trueStatusConditions) ||
    hasFailedUnknownStatus(trueStatusConditions) || { status: NODE_STATUS_READY }
  );
};
