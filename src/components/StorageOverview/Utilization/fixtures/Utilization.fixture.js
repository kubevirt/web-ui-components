import { noop } from 'patternfly-react';

import { Utilization } from '../Utilization';

const time0 = 1000;
const KiB = 1024;

export const utilizationStats = {
  iopsUtilization: {
    data: {
      result: [
        {
          values: [[time0, 0], [time0 + 10, 10], [time0 + 20, 15], [time0 + 30, 100], [time0 + 40, 50]],
        },
      ],
    },
  },
  latencyUtilization: {
    data: {
      result: [
        {
          values: [[time0, 0], [time0 + 10, 10], [time0 + 20, 15], [time0 + 30, 100], [time0 + 40, 50]],
        },
      ],
    },
  },
  throughputUtilization: {
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
  recoveryRateUtilization: {
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
  utilizationCallback: noop,
};

export const emptyUtilization = {
  iopsUtilization: {
    data: {
      result: [],
    },
  },
  latencyUtilization: {
    data: {
      result: [],
    },
  },
  throughputUtilization: {
    data: {
      result: [],
    },
  },
  recoveryRateUtilization: {
    data: {
      result: [],
    },
  },
  utilizationCallback: noop,
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
  {
    component: Utilization,
    name: 'Not available utilization',
    props: emptyUtilization,
  },
];
