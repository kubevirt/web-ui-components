import { SubsystemHealth } from '../SubsystemHealth';
import { OK_STATE } from '../../Dashboard/Health/HealthItem';

export const healthData = {
  k8sHealth: {
    response: 'ok',
  },
  cephHealth: {
    result: [
      {
        value: [null, 0],
      },
    ],
  },
  kubevirtHealth: {
    apiserver: {
      connectivity: 'ok',
    },
  },
};

export default [
  {
    component: SubsystemHealth,
    props: { state: OK_STATE, ...healthData },
  },
];
