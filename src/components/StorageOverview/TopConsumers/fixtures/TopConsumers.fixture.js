import { TopConsumers } from '../TopConsumers';

export const topConsumers = {
  data: {
    result: [
      {
        metric: {
          namespace: 'openshift-namespace',
        },
        values: [[1554797100, '46161920']],
      },
    ],
  },
};

export const emptyTopConsumers = {
  data: {
    result: [],
  },
};

export default [
  {
    component: TopConsumers,
    props: topConsumers,
  },
  {
    component: TopConsumers,
    name: 'Loading top consumers',
  },
];
