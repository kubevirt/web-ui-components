import { Utilization } from '../Utilization';

const time0 = 1000;
const KiB = 1024;

export const utilizationStats = {
  cpuUtilization: {
    data: {
      result: [
        {
          values: [[time0, 0], [time0 + 10, 10], [time0 + 20, 15], [time0 + 30, 100], [time0 + 40, 50]],
        },
      ],
    },
  },
  memoryUtilization: {
    data: {
      result: [
        {
          values: [
            [time0, 2 * KiB],
            [time0 + 10, 5 * KiB],
            [time0 + 20, 15 * KiB],
            [time0 + 30, 10 * KiB],
            [time0 + 40, 30 * KiB],
          ],
        },
      ],
    },
  },
  memoryTotal: {
    data: {
      result: [
        {
          value: [0, 100 * KiB],
        },
      ],
    },
  },
  storageTotal: {
    data: {
      result: [
        {
          value: [0, 10 * KiB],
        },
      ],
    },
  },
  storageUsed: {
    data: {
      result: [
        {
          values: [
            [time0, 1 * KiB],
            [time0 + 10, 3 * KiB],
            [time0 + 20, 4 * KiB],
            [time0 + 30, 8 * KiB],
            [time0 + 40, 5 * KiB],
          ],
        },
      ],
    },
  },
  storageIORW: {
    data: {
      result: [
        {
          values: [[time0, 0], [time0 + 10, 200], [time0 + 20, 500], [time0 + 30, 300], [time0 + 40, 1000]],
        },
      ],
    },
  },
};

export default [
  {
    component: Utilization,
    name: 'Utilization',
    props: utilizationStats,
  },
  {
    component: Utilization,
    name: 'Loading utilization',
    props: {},
  },
];
