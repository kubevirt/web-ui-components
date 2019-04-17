import { SubsystemHealth } from '../SubsystemHealth';
import { OK_STATE, WARNING_STATE, ERROR_STATE } from '../../Health/HealthItem';
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
    props: { ...healthData },
  },
];
