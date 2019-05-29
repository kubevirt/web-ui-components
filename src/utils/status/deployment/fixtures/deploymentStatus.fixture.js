import {
  DEPLOYMENT_STATUS_FAILED,
  DEPLOYMENT_STATUS_UNKNOWN,
  DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  DEPLOYMENT_STATUS_PROGRESSING,
} from '../constants';

import { vmWareDeploymentProgressing, vmWareDeploymentFailed, vmWareDeployment } from '../../../../tests/mocks/v2v';

export default [
  {
    deployment: null,
    expected: DEPLOYMENT_STATUS_UNKNOWN,
  },
  {
    deployment: vmWareDeploymentFailed,
    expected: DEPLOYMENT_STATUS_FAILED,
  },
  {
    deployment: vmWareDeploymentProgressing,
    expected: DEPLOYMENT_STATUS_PROGRESSING,
  },
  {
    deployment: vmWareDeployment,
    expected: DEPLOYMENT_STATUS_ROLLOUT_COMPLETE,
  },
];
