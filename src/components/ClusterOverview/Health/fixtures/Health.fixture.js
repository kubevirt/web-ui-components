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
      connectivity: 'error',
    },
  },
};

const healthDataWarning = {
  ...healthData,
  cephHealth: {
    data: {
      result: [
        {
          value: [null, 1],
        },
      ],
    },
  },
};

export default [
  {
    component: Health,
    name: 'Health',
    props: { ...healthData },
  },
  {
    component: Health,
    name: 'loading health',
    props: {},
  },
  {
    component: Health,
    name: 'error health',
    props: { ...healthDataErrors },
  },
  {
    component: Health,
    name: 'warning health',
    props: { ...healthDataWarning },
  },
];
