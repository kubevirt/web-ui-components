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
    name: 'with maxY defined',
    props: {
      id: 'item-id',
      title: 'title',
      data: [10, 0, 15, 100, 5],
      maxY: 100,
      unit: '%',
    },
  },
  {
    component: UtilizationItem,
    name: 'loading item',
    props: {
      id: 'item-id',
      title: 'title',
      unit: '%',
      isLoading: true,
    },
  },
  {
    component: UtilizationItem,
    name: 'not available item',
    props: {
      id: 'item-id',
      title: 'title',
      unit: '%',
      isLoading: true,
    },
  },
];
