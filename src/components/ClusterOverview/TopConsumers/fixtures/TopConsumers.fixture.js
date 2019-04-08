import { TopConsumers } from '../TopConsumers';

const getResults = key => [
  {
    metric: {
      [key]: 'key1',
    },
    value: [0, 15],
  },
  {
    metric: {
      [key]: 'key2',
    },
    value: [0, 25],
  },
  {
    metric: {
      [key]: 'key3',
    },
    value: [0, 35],
  },
  {
    metric: {
      [key]: 'key4',
    },
    value: [0, 55],
  },
  {
    metric: {
      [key]: 'key5',
    },
    value: [0, 45],
  },
];

export const consumersData = {
  workloadCpuResults: {
    data: {
      result: getResults('pod_name'),
    },
  },
  workloadMemoryResults: {
    data: {
      result: getResults('pod_name'),
    },
  },
  workloadStorageResults: {
    data: {
      result: getResults('pod_name'),
    },
  },
  workloadNetworkResults: {
    data: {
      result: getResults('pod_name'),
    },
  },
  infraCpuResults: {
    data: {
      result: getResults('node'),
    },
  },
  infraMemoryResults: {
    data: {
      result: getResults('node'),
    },
  },
  infraStorageResults: {
    data: {
      result: getResults('node'),
    },
  },
  infraNetworkResults: {
    data: {
      result: getResults('node'),
    },
  },
};

export default [
  {
    component: TopConsumers,
    props: { ...consumersData },
  },
  {
    component: TopConsumers,
    name: 'Loading top consumers',
  },
];
