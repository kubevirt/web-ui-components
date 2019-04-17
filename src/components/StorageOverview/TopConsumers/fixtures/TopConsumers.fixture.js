import { TopConsumers } from '../TopConsumers';
import { InlineLoading } from '../../../Loading';

export const TopConsumerStats = [
  {
    topConsumerStats: [],
    topConsumerLoaded: true,
    LoadingComponent: InlineLoading,
  },
  {
    topConsumerStats: [
      {
        metric: {
          namespace: 'openshift-namespace',
        },
        values: [[1554797100, '46161920']],
      },
    ],
    topConsumerLoaded: true,
    LoadingComponent: InlineLoading,
  },
];

export default [
  {
    component: TopConsumers,
    props: { ...TopConsumerStats },
  },
  {
    component: TopConsumers,
    name: 'Loading top consumers',
  },
];
