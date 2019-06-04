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
  capacityTotal: getPromResponse(11),
  capacityUsed: getPromResponse(5),
  capacityRequested: getPromResponse(7),
  vmsCapacity: getPromResponse(3),
  podsCapacity: getPromResponse(10),
};

export default [
  {
    component: Capacity,
    name: 'Capacity',
    props: capacityStats,
  },
  {
    component: Capacity,
    name: 'Loading Capacity',
    props: {},
  },
];
