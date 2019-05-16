import { TopConsumers } from '../TopConsumers';

export const topConsumers = {
  projectsUsedCapacity: {
    data: {
      result: [
        {
          metric: {
            namespace: 'openshift-namespace1',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
  },
  projectsRequestedCapacity: {
    data: {
      result: [
        {
          metric: {
            namespace: 'openshift-namespace2',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
  },
  slClassesUsedCapacity: {
    data: {
      result: [
        {
          metric: {
            storageclass: 'openshift-storageclass1',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
  },
  slClassesRequestedCapacity: {
    data: {
      result: [
        {
          metric: {
            storageclass: 'openshift-storageclass2',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
  },
  podsUsedCapacity: {
    data: {
      result: [
        {
          metric: {
            pod: 'openshift-pod1',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
  },
  podsRequestedCapacity: {
    data: {
      result: [
        {
          metric: {
            pod: 'openshift-pod2',
          },
          values: [[1554797100, '46161920']],
        },
      ],
    },
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
    name: 'Top Consumers',
    props: topConsumers,
  },
  {
    component: TopConsumers,
    name: 'Loading top consumers',
    props: {},
  },
  {
    component: TopConsumers,
    name: 'Not available top consumers',
    props: emptyTopConsumers,
  },
];
