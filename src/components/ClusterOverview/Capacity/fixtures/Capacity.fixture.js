import { Capacity } from '../Capacity';

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
  cpuUsed: getPromResponse(5),
  memoryTotal: getPromResponse(10),
  memoryUsed: getPromResponse(5),
  storageTotal: getPromResponse(10),
  storageUsed: getPromResponse(5),
  networkTotal: getPromResponse(10),
  networkUsed: getPromResponse(5),
};

export default {
  component: Capacity,
  props: capacityStats,
};
