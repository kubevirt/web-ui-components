import { Capacity } from '../Capacity';
import { utilizationStats } from '../../Utilization/fixtures/Utilization.fixture';

const getPromResponse = value => ({
  data: {
    result: [
      {
        value: [0, value],
      },
    ],
  },
});

export const capacityStats = {
  cpuUtilization: utilizationStats.cpuUtilization,
  memoryTotal: getPromResponse(1024 * 1024),
  memoryUtilization: utilizationStats.memoryUtilization,
  storageTotal: getPromResponse(10),
  storageUsed: getPromResponse(5),
  networkTotal: getPromResponse(10),
  networkUsed: getPromResponse(5),
};

export default {
  component: Capacity,
  props: capacityStats,
};
