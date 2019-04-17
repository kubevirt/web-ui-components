import { get } from 'lodash';
import { LOADING_STATE, OK_STATE, ERROR_STATE, WARNING_STATE } from './HealthItem';
import { OCS_HEALTHY, OCS_DEGRADED, OCS_ERROR, OCS_UNKNOWN, OCP_HEALTHY, OCP_ERROR, CNV_HEALTHY, CNV_ERROR } from './strings';

export const getKubevirtHealthState = kubevirtHealth => {
  if (!kubevirtHealth) {
    return {state: LOADING_STATE}
  }
  return get(kubevirtHealth, 'apiserver.connectivity') === 'ok' ?
  {message: CNV_HEALTHY, state: OK_STATE} : {message: CNV_ERROR, state: ERROR_STATE};
}

export const getK8sHealthState = k8sHealth => {
  if (!k8sHealth) {
    return {state: LOADING_STATE}
  }
  return get(k8sHealth, 'response') === 'ok' ?
    {message: OCP_HEALTHY, state: OK_STATE} : {message: OCP_ERROR, state: ERROR_STATE};
}

const OCSHealthStatus = {
  0: {
    message: OCS_HEALTHY,
    state: OK_STATE,
  },
  1: {
    message: OCS_DEGRADED,
    state: WARNING_STATE,
  },
  2: {
    message: OCS_ERROR,
    state: ERROR_STATE,
  },
  3: {
    message: OCS_UNKNOWN,
    state: ERROR_STATE,
  },
};

export const getOCSHealthState = ocsResponse => {
  if (!ocsResponse) {
    return {state: LOADING_STATE}
  }
  const value = get(ocsResponse, 'result[0].value[1]');
  return OCSHealthStatus[value] || OCSHealthStatus[3];
}