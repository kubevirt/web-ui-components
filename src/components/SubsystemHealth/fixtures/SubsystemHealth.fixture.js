import { SubsystemHealth } from '../SubsystemHealth';
import { OK_STATE } from '../../Dashboard/Health/HealthItem';

export const healthData = {
  k8sHealth: {
    state: OK_STATE,
    response: 'ok',
  },
  cephHealth: {
    state: OK_STATE,
    result: [
      {
        value: [null, 0],
      },
    ],
  },
  kubevirtHealth: {
    state: OK_STATE,
    apiserver: {
      connectivity: 'ok',
    },
  },
};

export default [
  {
    component: SubsystemHealth,
    props: { ...healthData },
  },
];
