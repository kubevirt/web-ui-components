import { Utilization } from '../Utilization';

const time0 = 1000;

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
};

export default {
  component: Utilization,
  props: utilizationStats,
};
