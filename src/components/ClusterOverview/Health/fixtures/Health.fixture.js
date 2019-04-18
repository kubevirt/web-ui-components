import { Health } from '../Health';

export const healthData = {
  k8sHealth: {
    response: 'ok',
  },
  cephHealth: {
    data: {
      result: [
        {
          value: [null, 0],
        },
      ],
    },
  },
  kubevirtHealth: {
    apiserver: {
      connectivity: 'ok',
    },
  },
};

export const healthDataErrors = {
  k8sHealth: {
    response: 'error',
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
      connectivity: 'error',
    },
  },
};

export default [
  {
    component: Health,
    props: { ...healthData },
  },
  {
    component: Health,
    props: { ...healthDataErrors },
  },
];
