import { Capacity } from '../Capacity';

export const emptyCapacityStats = {
  stats: {
    cpuStats: {
      title: 'CPU',
      data: {},
    },
    memoryStats: {
      title: 'Memory',
      data: {},
    },
    storageStats: {
      title: 'Storage',
      data: {},
    },
    networkStats: {
      title: 'Network',
      data: {},
    },
  },
  loaded: false,
};

export const capacityStats = {
  stats: {
    cpuStats: {
      title: 'CPU',
      unit: 'Ghz',
      data: {
        total: 4.3,
        used: 2.2,
      },
    },
    memoryStats: {
      title: 'Memory',
      unit: 'Ti',
      data: {
        total: 200,
        used: 80,
      },
    },
    storageStats: {
      title: 'Storage',
      unit: 'Ti',
      data: {
        total: 800,
        used: 400,
      },
    },
    networkStats: {
      title: 'Network',
      unit: 'GBps',
      data: {
        total: 10,
        used: 3,
      },
    },
  },
  loaded: true,
};

export default {
  component: Capacity,
  props: { ...capacityStats },
};
