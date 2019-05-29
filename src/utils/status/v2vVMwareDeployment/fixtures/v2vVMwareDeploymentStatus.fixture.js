import {
  V2V_WMWARE_DEPLOYMENT_STATUS_FAILED,
  V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN,
  V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING,
  V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED,
} from '../constants';

import {
  vmWareDeploymentProgressing,
  vmWareDeploymentFailed,
  vmWareDeployment,
  vmWareDeploymentFailedPod,
} from '../../../../tests/mocks/v2v';

export default [
  {
    deployment: null,
    deploymentPods: null,
    expected: V2V_WMWARE_DEPLOYMENT_STATUS_UNKNOWN,
  },
  {
    deployment: vmWareDeploymentProgressing,
    expected: V2V_WMWARE_DEPLOYMENT_STATUS_PROGRESSING,
  },
  {
    deployment: vmWareDeploymentFailed,
    expected: V2V_WMWARE_DEPLOYMENT_STATUS_FAILED,
  },
  {
    deployment: vmWareDeploymentProgressing,
    deploymentPods: [vmWareDeploymentFailedPod],
    expected: V2V_WMWARE_DEPLOYMENT_STATUS_POD_FAILED,
  },
  {
    deployment: vmWareDeployment,
    expected: V2V_WMWARE_DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  },
];
