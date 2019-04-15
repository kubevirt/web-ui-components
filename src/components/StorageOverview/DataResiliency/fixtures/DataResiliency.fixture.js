import { DataResiliency } from '../DataResiliency';
import { InlineLoading } from '../../../Loading';

export const dataResiliencyData = {
  0: {
    totalPgRaw: {},
    cleanAndActivePgRaw: {},
    LoadingComponent: InlineLoading,
  },
  1: {
    totalPgRaw: {
      data: {
        result: [{ value: [15465685876, 100] }],
      },
    },
    cleanAndActivePgRaw: {
      data: {
        result: [{ value: [1656575757, 67] }],
      },
    },
    LoadingComponent: InlineLoading,
  },
  2: {
    totalPgRaw: {
      data: {
        result: [{ value: [15465685876, 100] }],
      },
    },
    cleanAndActivePgRaw: {
      data: {
        result: [{ value: [1656575757, 100] }],
      },
    },
    LoadingComponent: InlineLoading,
  },
};

export default [
  {
    component: DataResiliency,
    props: { ...dataResiliencyData['0'] },
  },
];
