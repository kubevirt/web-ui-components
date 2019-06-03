import {
  DEPLOYMENT_STATUS_FAILED,
  DEPLOYMENT_STATUS_PROGRESSING,
  DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  DEPLOYMENT_STATUS_UNKNOWN,
} from './constants';

import { getConditionReason, getStatusConditionOfType, isConditionStatusTrue } from '../../../selectors';

import { NOT_HANDLED } from '..';

export const getStatus = deployment => {
  const progressingCond = getStatusConditionOfType(deployment, 'Progressing');
  const failureCond = getStatusConditionOfType(deployment, 'ReplicaFailure');

  if (progressingCond) {
    const progressingReason = getConditionReason(progressingCond);
    if (isConditionStatusTrue(progressingCond) && !isConditionStatusTrue(failureCond)) {
      if (progressingReason === 'NewReplicaSetAvailable') {
        return { status: DEPLOYMENT_STATUS_ROLLOUT_COMPLETE, message: progressingReason };
      }

      return { status: DEPLOYMENT_STATUS_PROGRESSING, message: progressingReason };
    }
    return { status: DEPLOYMENT_STATUS_FAILED, message: getConditionReason(failureCond) || progressingReason };
  }
  return NOT_HANDLED;
};

export const getDeploymentStatus = deployment => getStatus(deployment) || { status: DEPLOYMENT_STATUS_UNKNOWN };

export const getSimpleDeploymentStatus = deployment => getDeploymentStatus(deployment).status;
