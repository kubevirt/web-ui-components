import {
  V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING,
  V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  V2V_WMWARE_DEPLOYMENT_STATUS_FAILED,
  V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED,
  V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN,
} from './constants';
import {
  getDeploymentStatus,
  DEPLOYMENT_STATUS_PROGRESSING,
  DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  DEPLOYMENT_STATUS_FAILED,
} from '../deployment';
import { getSimplePodStatus, getPodStatus, POD_STATUS_ALL_ERROR } from '../pod';
import { NOT_HANDLED } from '../common';

const deploymentStatusMapper = {
  [DEPLOYMENT_STATUS_PROGRESSING]: V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING,
  [DEPLOYMENT_STATUS_ROLLOUT_COMPLETE]: V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  [DEPLOYMENT_STATUS_FAILED]: V2V_WMWARE_DEPLOYMENT_STATUS_FAILED,
};

const getStatus = (deployment, deploymentPods) => {
  const deploymentStatus = getDeploymentStatus(deployment);

  if (deploymentPods && deploymentStatus.status === DEPLOYMENT_STATUS_PROGRESSING) {
    const failingPod = deploymentPods.find(pod => POD_STATUS_ALL_ERROR.includes(getSimplePodStatus(pod)));

    if (failingPod) {
      return {
        status: V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED,
        pod: failingPod,
        message: getPodStatus(failingPod).message,
        deployment,
      };
    }
  }

  const mappedStatus = deploymentStatus && deploymentStatusMapper[deploymentStatus.status];

  if (mappedStatus) {
    return {
      ...deploymentStatus,
      status: mappedStatus,
      deployment,
    };
  }

  return NOT_HANDLED;
};

export const getV2vVMwareDeploymentStatus = (deployment, deploymentPods) =>
  getStatus(deployment, deploymentPods) || { status: V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN };

export const getSimpleV2vVMwareDeploymentStatus = (deployment, deploymentPods) =>
  getV2vVMwareDeploymentStatus(deployment, deploymentPods).status;
