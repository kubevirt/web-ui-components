import { SubsystemHealth } from '../SubsystemHealth';

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
    props: { ...healthData },
  },
];
