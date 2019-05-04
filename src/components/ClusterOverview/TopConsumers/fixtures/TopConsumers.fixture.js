import { TopConsumers } from '../TopConsumers';

const getResults = (metric, key) => [
  {
    metric: {
      [key]: `${metric}-key1`,
    },
    value: ['0', '15'],
  },
  {
    metric: {
      [key]: `${metric}-key2`,
    },
    value: ['0', '25'],
  },
  {
    metric: {
      [key]: `${metric}-key3`,
    },
    value: ['0', '35'],
  },
  {
    metric: {
      [key]: `${metric}-key4`,
    },
    value: ['0', '55'],
  },
  {
    metric: {
      [key]: `${metric}-key5`,
    },
    value: ['0', '45'],
  },
];

export const consumersData = {
  workloadCpuResults: {
    data: {
      result: getResults('workload-cpu', 'pod_name'),
    },
  },
  workloadMemoryResults: {
    data: {
      result: getResults('workload-mem', 'pod_name'),
    },
  },
  workloadStorageResults: {
    data: {
      result: getResults('workload-storage', 'pod_name'),
    },
  },
  workloadNetworkResults: {
    data: {
      result: getResults('workload-net', 'pod_name'),
    },
  },
  infraCpuResults: {
    data: {
      result: getResults('infra-cpu', 'node'),
    },
  },
  infraMemoryResults: {
    data: {
      result: getResults('infra-mem', 'node'),
    },
  },
  infraStorageResults: {
    data: {
      result: getResults('infra-storage', 'node'),
    },
  },
  infraNetworkResults: {
    data: {
      result: getResults('infra-net', 'node'),
    },
  },
};

const notAvailableConsumers = () => {
  const notAvailableData = {};
  Object.keys(consumersData).forEach(key => {
    notAvailableData[key] = {};
  });
  return notAvailableData;
};

export default [
  {
    component: TopConsumers,
    name: 'Top Consumers',
    props: { ...consumersData },
  },
  {
    component: TopConsumers,
    name: 'Loading top consumers',
    props: {},
  },
  {
    component: TopConsumers,
    name: 'Not available top consumers',
    props: { ...notAvailableConsumers() },
  },
];
