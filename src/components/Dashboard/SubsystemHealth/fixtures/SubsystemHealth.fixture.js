import { SubsystemHealth } from '../SubsystemHealth';
import { OK_STATE, WARNING_STATE, ERROR_STATE, LOADING_STATE } from '../../Health/HealthItem';
import { OCP_HEALTHY, CNV_ERROR, OCS_DEGRADED } from '../../Health/strings';

export const healthData = {
  k8sHealth: {
    state: OK_STATE,
    message: OCP_HEALTHY,
  },
  cephHealth: {
    message: OCS_DEGRADED,
    state: WARNING_STATE,
  },
  kubevirtHealth: {
    state: ERROR_STATE,
    message: CNV_ERROR,
  },
};

export default [
  {
    component: SubsystemHealth,
    name: 'Subsystem health',
    props: { ...healthData },
  },
  {
    component: SubsystemHealth,
    name: 'Loading subsystem health',
    props: {
      k8sHealth: {
        state: LOADING_STATE,
      },
      cephHealth: {
        state: LOADING_STATE,
      },
      kubevirtHealth: {
        state: LOADING_STATE,
      },
    },
  },
];
