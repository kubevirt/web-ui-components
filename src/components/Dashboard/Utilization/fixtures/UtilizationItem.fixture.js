import { UtilizationItem } from '../UtilizationItem';

export default [
  {
    component: UtilizationItem,
    props: {
      id: 'item-id',
      title: 'title',
      data: [10, 0, 15, 100, 5],
      unit: '%',
    },
  },
  {
    component: UtilizationItem,
    props: {
      id: 'item-id',
      title: 'title',
      data: [10, 0, 15, 100, 5],
      maxY: 100,
      unit: '%',
    },
  },
];
