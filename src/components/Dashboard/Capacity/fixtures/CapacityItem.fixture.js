import { CapacityItem } from '../CapacityItem';
import { InlineLoading } from '../../../Loading';

export default [
  {
    component: CapacityItem,
    name: 'Capacity Item',
    props: {
      id: 'item-id',
      title: 'title',
      used: 50,
      total: 100,
      unit: 'unit',
      isLoading: false,
      LoadingComponent: InlineLoading,
    },
  },
  {
    component: CapacityItem,
    name: 'Loading capacity item',
    props: {
      id: 'item-id',
      title: 'title',
      isLoading: true,
      LoadingComponent: InlineLoading,
    },
  },
  {
    component: CapacityItem,
    name: 'Unknown capacity item',
    props: {
      id: 'item-id',
      title: 'title',
      isLoading: false,
      LoadingComponent: InlineLoading,
    },
  },
];
